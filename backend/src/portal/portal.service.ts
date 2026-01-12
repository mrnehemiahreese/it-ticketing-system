import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { KnowledgeArticle } from '../database/entities/knowledge-article.entity';
import { CustomerDashboard, CustomerStats } from './dto/customer-stats.dto';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { TicketPriority } from '../common/enums/ticket-priority.enum';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(KnowledgeArticle)
    private knowledgeArticleRepository: Repository<KnowledgeArticle>,
  ) {}

  async getCustomerDashboard(user: User): Promise<CustomerDashboard> {
    const stats = await this.getCustomerStats(user);
    const recentTickets = await this.getRecentTickets(user, 5);
    const popularArticles = await this.getPopularArticles(5);

    return {
      stats,
      recentTickets,
      popularArticles,
    };
  }

  async getCustomerStats(user: User): Promise<CustomerStats> {
    const userId = user.id;

    // Get all tickets for this customer
    const allTickets = await this.ticketRepository.find({
      where: [{ createdById: userId }, { assignedToId: userId }],
    });

    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter((t) => t.status === TicketStatus.OPEN).length;
    const inProgressTickets = allTickets.filter(
      (t) => t.status === TicketStatus.IN_PROGRESS,
    ).length;
    const resolvedTickets = allTickets.filter((t) => t.status === TicketStatus.RESOLVED).length;
    const closedTickets = allTickets.filter((t) => t.status === TicketStatus.CLOSED).length;

    // Calculate average response time (time to first comment by agent)
    // Calculate average resolution time (time to resolved status)
    // For now, returning null - can be enhanced later
    const avgResponseTime = null;
    const avgResolutionTime = null;

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      avgResponseTime,
      avgResolutionTime,
    };
  }

  async getRecentTickets(user: User, limit: number = 5): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: [{ createdById: user.id }, { assignedToId: user.id }],
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['createdBy', 'assignedTo'],
    });
  }

  async getCustomerTickets(
    user: User,
    status?: TicketStatus,
    priority?: TicketPriority,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Ticket[]> {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .where('(ticket.createdById = :userId OR ticket.assignedToId = :userId)', {
        userId: user.id,
      })
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo');

    if (status) {
      query.andWhere('ticket.status = :status', { status });
    }

    if (priority) {
      query.andWhere('ticket.priority = :priority', { priority });
    }

    query.orderBy('ticket.createdAt', 'DESC').take(limit).skip(offset);

    return query.getMany();
  }

  private async getPopularArticles(limit: number = 5): Promise<KnowledgeArticle[]> {
    return this.knowledgeArticleRepository.find({
      where: { isPublished: true },
      order: { views: 'DESC' },
      take: limit,
    });
  }
}
