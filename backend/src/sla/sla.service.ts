import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, IsNull, Not } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SlaPolicy } from "./entities/sla-policy.entity";
import { Ticket } from "../tickets/entities/ticket.entity";
import { User } from "../users/entities/user.entity";
import { TicketStatus } from "../common/enums/ticket-status.enum";
import { Role } from "../common/enums/role.enum";
import { SlackService } from "../slack/slack.service";

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(
    @InjectRepository(SlaPolicy)
    private slaPolicyRepository: Repository<SlaPolicy>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private slackService: SlackService,
  ) {}

  /**
   * Get SLA policy for a given priority
   */
  async getPolicyForPriority(priority: string): Promise<SlaPolicy | null> {
    return this.slaPolicyRepository.findOne({
      where: { priority, isActive: true },
    });
  }

  /**
   * Apply SLA to a ticket based on its priority
   */
  async applySlaToPicket(ticket: Ticket): Promise<Ticket> {
    const policy = await this.getPolicyForPriority(ticket.priority);
    
    if (!policy) {
      this.logger.warn(`No SLA policy found for priority: ${ticket.priority}`);
      return ticket;
    }

    const now = new Date();
    ticket.slaPolicyId = policy.id;
    ticket.slaResponseDueAt = new Date(now.getTime() + policy.responseTimeMinutes * 60000);
    ticket.slaResolutionDueAt = new Date(now.getTime() + policy.resolutionTimeMinutes * 60000);
    
    return ticket;
  }

  /**
   * Check and mark SLA breaches - runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkSlaBreaches(): Promise<void> {
    this.logger.log("Checking for SLA breaches...");
    
    const now = new Date();
    
    // Find tickets that have breached resolution SLA
    const breachedTickets = await this.ticketRepository.find({
      where: {
        status: Not(TicketStatus.CLOSED),
        slaBreached: false,
        slaResolutionDueAt: LessThan(now),
      },
      relations: ["createdBy", "assignedTo"],
    });

    for (const ticket of breachedTickets) {
      ticket.slaBreached = true;
      await this.ticketRepository.save(ticket);
      
      this.logger.warn(`SLA breached for ticket ${ticket.ticketNumber}`);
      
      // Notify via Slack
      await this.slackService.notifySlaBreached(ticket).catch(err => {
        this.logger.error(`Failed to notify Slack of SLA breach: ${err.message}`);
      });
    }

    this.logger.log(`Processed ${breachedTickets.length} SLA breaches`);
  }

  /**
   * Check and escalate tickets - runs every 10 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkEscalations(): Promise<void> {
    this.logger.log("Checking for ticket escalations...");
    
    const now = new Date();
    
    // Find tickets due for escalation
    const ticketsToEscalate = await this.ticketRepository
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.slaPolicy", "slaPolicy")
      .leftJoinAndSelect("ticket.createdBy", "createdBy")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .where("ticket.status IN (:...statuses)", { 
        statuses: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] 
      })
      .andWhere("ticket.escalatedAt IS NULL")
      .andWhere("slaPolicy.escalationEnabled = :enabled", { enabled: true })
      .andWhere("slaPolicy.escalationAfterMinutes IS NOT NULL")
      .andWhere(
        "ticket.createdAt + (slaPolicy.escalationAfterMinutes * interval 1 minute) < :now",
        { now }
      )
      .getMany();

    for (const ticket of ticketsToEscalate) {
      await this.escalateTicket(ticket);
    }

    this.logger.log(`Escalated ${ticketsToEscalate.length} tickets`);
  }

  /**
   * Escalate a ticket to a supervisor/manager
   */
  async escalateTicket(ticket: Ticket): Promise<Ticket> {
    const policy = await this.slaPolicyRepository.findOne({
      where: { id: ticket.slaPolicyId },
      relations: ["escalationToUser"],
    });

    if (!policy) return ticket;

    let escalateTo: User | null = policy.escalationToUser;
    
    // If no specific user configured, find an admin
    if (!escalateTo) {
      escalateTo = await this.userRepository
        .createQueryBuilder("user")
        .where("user.roles LIKE :role", { role: `%${Role.ADMIN}%` })
        .andWhere("user.isDisabled = :disabled", { disabled: false })
        .getOne();
    }

    if (escalateTo) {
      ticket.escalatedAt = new Date();
      ticket.escalatedToId = escalateTo.id;
      await this.ticketRepository.save(ticket);

      this.logger.log(`Escalated ticket ${ticket.ticketNumber} to ${escalateTo.fullname}`);

      // Notify via Slack
      await this.slackService.notifyEscalation(ticket, escalateTo).catch(err => {
        this.logger.error(`Failed to notify Slack of escalation: ${err.message}`);
      });
    }

    return ticket;
  }

  /**
   * Mark SLA response as met when ticket gets first comment/assignment
   */
  async markResponseMet(ticketId: string): Promise<void> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    
    if (ticket && !ticket.slaResponseMetAt && ticket.slaResponseDueAt) {
      ticket.slaResponseMetAt = new Date();
      await this.ticketRepository.save(ticket);
      this.logger.log(`SLA response met for ticket ${ticket.ticketNumber}`);
    }
  }

  /**
   * Get all active SLA policies
   */
  async findAllPolicies(): Promise<SlaPolicy[]> {
    return this.slaPolicyRepository.find({
      where: { isActive: true },
      order: { priority: "ASC" },
    });
  }

  /**
   * Get SLA statistics
   */
  async getSlaStats(): Promise<{
    totalTickets: number;
    breachedTickets: number;
    escalatedTickets: number;
    averageResolutionMinutes: number;
  }> {
    const totalTickets = await this.ticketRepository.count({
      where: { slaPolicyId: Not(IsNull()) },
    });

    const breachedTickets = await this.ticketRepository.count({
      where: { slaBreached: true },
    });

    const escalatedTickets = await this.ticketRepository.count({
      where: { escalatedAt: Not(IsNull()) },
    });

    // Calculate average resolution time for resolved tickets
    const result = await this.ticketRepository
      .createQueryBuilder("ticket")
      .select("AVG(EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt))/60)", "avgMinutes")
      .where("ticket.resolvedAt IS NOT NULL")
      .getRawOne();

    return {
      totalTickets,
      breachedTickets,
      escalatedTickets,
      averageResolutionMinutes: Math.round(result?.avgMinutes || 0),
    };
  }
}
