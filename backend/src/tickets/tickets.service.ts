import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketWatcher } from './entities/ticket-watcher.entity';
import { CreateTicketInput } from './dto/create-ticket.input';
import { UpdateTicketInput } from './dto/update-ticket.input';
import { TicketFiltersInput } from './dto/ticket-filters.input';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { Role } from '../common/enums/role.enum';
import { SlackService } from '../slack/slack.service';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketWatcher)
    private watchersRepository: Repository<TicketWatcher>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private slackService: SlackService,
    private emailService: EmailService,
  ) {}

  async create(createTicketInput: CreateTicketInput, userId: string): Promise<Ticket> {
    // Generate ticket number
    const count = await this.ticketsRepository.count();
    const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

    const ticket = this.ticketsRepository.create({
      ...createTicketInput,
      ticketNumber,
      createdById: userId,
      status: TicketStatus.OPEN,
    });

    const savedTicket = await this.ticketsRepository.save(ticket);
    const fullTicket = await this.findOne(savedTicket.id, null);

    // Notify Slack about new ticket and store thread_ts
    const threadTs = await this.slackService.notifyTicketCreated(fullTicket).catch(err => {
      console.error('Failed to notify Slack of ticket creation:', err);
      return null;
    });

    // Store the Slack thread timestamp for future replies
    if (threadTs) {
      fullTicket.slackThreadTs = threadTs;
      await this.ticketsRepository.save(fullTicket);
    }

    // Send email notification to the ticket creator
    const creator = fullTicket.createdBy || await this.usersRepository.findOne({ where: { id: userId } });
    if (creator) {
      await this.emailService.sendTicketCreatedNotification(fullTicket, creator).catch(err => {
        console.error("Failed to send ticket created email:", err);
      });
    }

    return fullTicket;
  }

  async findAll(filters?: TicketFiltersInput, user?: User): Promise<Ticket[]> {
    const query = this.ticketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .leftJoinAndSelect('ticket.comments', 'comments')
      .leftJoinAndSelect('ticket.attachments', 'attachments');

    // NEW: Customer filtering - non-admin/agent users can only see their own tickets
    if (user && !user.roles.includes(Role.ADMIN) && !user.roles.includes(Role.AGENT)) {
      query.andWhere(
        '(ticket.createdById = :userId OR ticket.assignedToId = :userId)',
        { userId: user.id }
      );
    }

    // Exclude archived tickets by default
    if (!filters?.includeArchived) {
      query.andWhere('ticket.status != :archivedStatus', { archivedStatus: TicketStatus.ARCHIVED });
    }

    if (filters) {
      if (filters.status) {
        query.andWhere('ticket.status = :status', { status: filters.status });
      }
      if (filters.priority) {
        query.andWhere('ticket.priority = :priority', { priority: filters.priority });
      }
      if (filters.category) {
        query.andWhere('ticket.category = :category', { category: filters.category });
      }
      if (filters.assignedToId) {
        query.andWhere('ticket.assignedToId = :assignedToId', { assignedToId: filters.assignedToId });
      }
      if (filters.createdById) {
        query.andWhere('ticket.createdById = :createdById', { createdById: filters.createdById });
      }
      if (filters.search) {
        query.andWhere(
          '(ticket.title LIKE :search OR ticket.description LIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
    }

    query.orderBy('ticket.createdAt', 'DESC');

    return query.getMany();
  }

  async findOne(id: string, user?: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo', 'comments', 'comments.user', 'attachments', 'attachments.uploadedBy'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // NEW: Verify user has access to this ticket
    if (user) {
      const isAdminOrAgent = user.roles.includes(Role.ADMIN) || user.roles.includes(Role.AGENT);
      const isOwnerOrAssigned = ticket.createdById === user.id || ticket.assignedToId === user.id;

      if (!isAdminOrAgent && !isOwnerOrAssigned) {
        throw new ForbiddenException('You do not have access to this ticket');
      }

      // Filter out internal comments for customers
      if (!isAdminOrAgent && ticket.comments) {
        ticket.comments = ticket.comments.filter(c => !c.isInternal);
      }
    }

    return ticket;
  }

  async findMyTickets(userId: string): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: [
        { createdById: userId },
        { assignedToId: userId },
      ],
      relations: ['createdBy', 'assignedTo', 'comments', 'attachments'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTicketInput: UpdateTicketInput, user: User): Promise<Ticket> {
    const ticket = await this.findOne(id, user);

    // Check permissions
    const isOwner = ticket.createdById === user.id;
    const isAssigned = ticket.assignedToId === user.id;
    const isAdmin = user.roles.includes(Role.ADMIN);
    const isAgent = user.roles.includes(Role.AGENT);

    if (!isOwner && !isAssigned && !isAdmin && !isAgent) {
      throw new ForbiddenException('You do not have permission to update this ticket');
    }

    // Store previous values for change tracking
    const previousStatus = ticket.status;
    const previousPriority = ticket.priority;
    const previousAssignedTo = ticket.assignedToId;

    // Handle status changes
    if (updateTicketInput.status) {
      if (updateTicketInput.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
      if (updateTicketInput.status === TicketStatus.CLOSED && !ticket.closedAt) {
        ticket.closedAt = new Date();
      }
      if (updateTicketInput.status === TicketStatus.REOPENED) {
        ticket.resolvedAt = null;
        ticket.closedAt = null;
      }
    }

    Object.assign(ticket, updateTicketInput);
    const savedTicket = await this.ticketsRepository.save(ticket);
    const fullTicket = await this.findOne(savedTicket.id, null);

    // Notify Slack about updates
    const changes: any = {};
    if (previousStatus !== updateTicketInput.status) changes.status = { from: previousStatus, to: updateTicketInput.status };
    if (previousPriority !== updateTicketInput.priority) changes.priority = { from: previousPriority, to: updateTicketInput.priority };
    if (previousAssignedTo !== updateTicketInput.assignedToId) changes.assignedTo = { from: previousAssignedTo, to: updateTicketInput.assignedToId };

    if (Object.keys(changes).length > 0) {
      await this.slackService.notifyTicketUpdated(fullTicket, changes).catch(err => {
        console.error('Failed to notify Slack of ticket update:', err);
      });
    }

    // Notify if assigned
    if (previousAssignedTo !== updateTicketInput.assignedToId && updateTicketInput.assignedToId) {
      await this.slackService.notifyAssignment(fullTicket).catch(err => {
        console.error('Failed to notify Slack of assignment:', err);
      });
    }

    return fullTicket;
  }

  async remove(id: string, user: User): Promise<boolean> {
    const ticket = await this.findOne(id, user);

    // Only admins or ticket creators can delete
    if (!user.roles.includes(Role.ADMIN) && ticket.createdById !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this ticket');
    }

    await this.ticketsRepository.remove(ticket);
    return true;
  }

  async addWatcher(ticketId: string, userId: string): Promise<TicketWatcher> {
    const existing = await this.watchersRepository.findOne({
      where: { ticketId, userId },
    });

    if (existing) {
      return existing;
    }

    const watcher = this.watchersRepository.create({ ticketId, userId });
    return this.watchersRepository.save(watcher);
  }

  async removeWatcher(ticketId: string, userId: string): Promise<boolean> {
    const watcher = await this.watchersRepository.findOne({
      where: { ticketId, userId },
    });

    if (watcher) {
      await this.watchersRepository.remove(watcher);
    }

    return true;
  }

  async getWatchers(ticketId: string): Promise<TicketWatcher[]> {
    return this.watchersRepository.find({ where: { ticketId } });
  }

  async assignTicket(ticketId: string, userId: string, user: User): Promise<Ticket> {
    const ticket = await this.findOne(ticketId, user);

    // Check if user has permission
    if (!user.roles.includes(Role.ADMIN) && !user.roles.includes(Role.AGENT)) {
      throw new ForbiddenException('Only admins and agents can assign tickets');
    }

    // Verify the user to assign exists
    const assignUser = await this.usersRepository.findOne({ where: { id: userId } });
    if (!assignUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const previousAssignedTo = ticket.assignedToId;
    ticket.assignedToId = userId;

    const savedTicket = await this.ticketsRepository.save(ticket);
    const fullTicket = await this.findOne(savedTicket.id, null);

    // Notify Slack if assignment changed
    if (previousAssignedTo !== userId) {
      await this.slackService.notifyAssignment(fullTicket).catch(err => {
        console.error('Failed to notify Slack of assignment:', err);
      });

      // Notify the customer who created the ticket that it has been assigned
      if (fullTicket.createdBy) {
        await this.emailService.sendTicketAssignedToCustomerNotification(fullTicket, fullTicket.createdBy, assignUser).catch(err => {
          console.error('Failed to send assignment email to customer:', err);
        });
      }
    }

    return fullTicket;
  }

  async getTicketStats() {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
    ] = await Promise.all([
      this.ticketsRepository.count(),
      this.ticketsRepository.count({ where: { status: TicketStatus.OPEN } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.RESOLVED } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.CLOSED } }),
    ]);

    return {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
    };

  }
  async findAllPaginated(
    filters: TicketFiltersInput | undefined,
    user: User | undefined,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Ticket[]; totalItems: number }> {
    const query = this.ticketsRepository.createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.createdBy", "createdBy")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .leftJoinAndSelect("ticket.comments", "comments")
      .leftJoinAndSelect("ticket.attachments", "attachments");

    // Customer filtering - non-admin/agent users can only see their own tickets
    if (user && !user.roles.includes(Role.ADMIN) && !user.roles.includes(Role.AGENT)) {
      query.andWhere(
        "(ticket.createdById = :userId OR ticket.assignedToId = :userId)",
        { userId: user.id }
      );
    }

    // Exclude archived tickets by default
    if (!filters?.includeArchived) {
      query.andWhere('ticket.status != :archivedStatus', { archivedStatus: TicketStatus.ARCHIVED });
    }

    if (filters) {
      if (filters.status) {
        query.andWhere("ticket.status = :status", { status: filters.status });
      }
      if (filters.priority) {
        query.andWhere("ticket.priority = :priority", { priority: filters.priority });
      }
      if (filters.category) {
        query.andWhere("ticket.category = :category", { category: filters.category });
      }
      if (filters.assignedToId) {
        query.andWhere("ticket.assignedToId = :assignedToId", { assignedToId: filters.assignedToId });
      }
      if (filters.createdById) {
        query.andWhere("ticket.createdById = :createdById", { createdById: filters.createdById });
      }
      if (filters.search) {
        query.andWhere(
          "(ticket.title LIKE :search OR ticket.description LIKE :search)",
          { search: `%${filters.search}%` }
        );
      }
    }

    query.orderBy("ticket.createdAt", "DESC");

    const totalItems = await query.getCount();
    const skip = (page - 1) * limit;
    const items = await query.skip(skip).take(limit).getMany();

    return { items, totalItems };
  }

  async userMarkResolved(ticketId: string, user: User): Promise<Ticket> {
    const ticket = await this.findOne(ticketId, user);

    // Only ticket creator can mark as resolved through this method
    if (ticket.createdById  !== user.id) {
      throw new ForbiddenException("Only the ticket creator can mark their ticket as resolved");
    }

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = new Date();

    const savedTicket = await this.ticketsRepository.save(ticket);
    return this.findOne(savedTicket.id, null);
  }

  async archiveTicket(ticketId: string, user: User): Promise<Ticket> {
    const ticket = await this.findOne(ticketId, user);

    // Only closed tickets can be archived
    if (ticket.status !== TicketStatus.CLOSED) {
      throw new ForbiddenException('Only closed tickets can be archived');
    }

    // Only admins can archive
    if (!user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can archive tickets');
    }

    ticket.status = TicketStatus.ARCHIVED;
    ticket.archivedAt = new Date();

    const savedTicket = await this.ticketsRepository.save(ticket);
    return this.findOne(savedTicket.id, null);
  }

  async autoArchiveClosedTickets(): Promise<number> {
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
    
    const result = await this.ticketsRepository
      .createQueryBuilder()
      .update()
      .set({ 
        status: TicketStatus.ARCHIVED,
        archivedAt: new Date()
      })
      .where('status = :status', { status: TicketStatus.CLOSED })
      .andWhere('closedAt <= :cutoff', { cutoff: tenHoursAgo })
      .execute();

    return result.affected || 0;
  }
}
