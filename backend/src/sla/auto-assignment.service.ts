import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, In } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Ticket } from "../tickets/entities/ticket.entity";
import { User } from "../users/entities/user.entity";
import { TicketStatus } from "../common/enums/ticket-status.enum";
import { Role } from "../common/enums/role.enum";
import { SlackService } from "../slack/slack.service";

interface AgentWorkload {
  agent: User;
  openTickets: number;
  inProgressTickets: number;
  totalActive: number;
}

@Injectable()
export class AutoAssignmentService {
  private readonly logger = new Logger(AutoAssignmentService.name);
  private lastAssignedIndex = 0; // For round-robin
  private autoAssignEnabled: boolean;

  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private slackService: SlackService,
  ) {
    this.autoAssignEnabled = this.configService.get<string>("AUTO_ASSIGN_ENABLED", "false") === "true";
    this.logger.log(`Auto-assignment is ${this.autoAssignEnabled ? "ENABLED" : "DISABLED"}`);
  }

  /**
   * Get available agents sorted by workload (least busy first)
   */
  async getAvailableAgents(): Promise<AgentWorkload[]> {
    // Get all active agents
    const agents = await this.userRepository
      .createQueryBuilder("user")
      .where("(user.roles LIKE :agent OR user.roles LIKE :admin)", {
        agent: `%${Role.AGENT}%`,
        admin: `%${Role.ADMIN}%`,
      })
      .andWhere("user.isDisabled = :disabled", { disabled: false })
      .getMany();

    // Calculate workload for each agent
    const workloads: AgentWorkload[] = [];
    
    for (const agent of agents) {
      const openTickets = await this.ticketRepository.count({
        where: {
          assignedToId: agent.id,
          status: TicketStatus.OPEN,
        },
      });

      const inProgressTickets = await this.ticketRepository.count({
        where: {
          assignedToId: agent.id,
          status: TicketStatus.IN_PROGRESS,
        },
      });

      workloads.push({
        agent,
        openTickets,
        inProgressTickets,
        totalActive: openTickets + inProgressTickets,
      });
    }

    // Sort by total active tickets (least busy first)
    return workloads.sort((a, b) => a.totalActive - b.totalActive);
  }

  /**
   * Auto-assign using round-robin algorithm
   */
  async assignRoundRobin(ticket: Ticket): Promise<User | null> {
    const workloads = await this.getAvailableAgents();
    
    if (workloads.length === 0) {
      this.logger.warn("No available agents for auto-assignment");
      return null;
    }

    // Round-robin selection
    this.lastAssignedIndex = (this.lastAssignedIndex + 1) % workloads.length;
    return workloads[this.lastAssignedIndex].agent;
  }

  /**
   * Auto-assign using least-busy algorithm
   */
  async assignLeastBusy(ticket: Ticket): Promise<User | null> {
    const workloads = await this.getAvailableAgents();
    
    if (workloads.length === 0) {
      this.logger.warn("No available agents for auto-assignment");
      return null;
    }

    // Return the least busy agent (already sorted)
    return workloads[0].agent;
  }

  /**
   * Auto-assign a ticket (main entry point)
   */
  async autoAssignTicket(
    ticket: Ticket,
    algorithm: "round-robin" | "least-busy" = "least-busy"
  ): Promise<Ticket> {
    if (ticket.assignedToId) {
      this.logger.log(`Ticket ${ticket.ticketNumber} already assigned, skipping`);
      return ticket;
    }

    let assignee: User | null = null;

    switch (algorithm) {
      case "round-robin":
        assignee = await this.assignRoundRobin(ticket);
        break;
      case "least-busy":
      default:
        assignee = await this.assignLeastBusy(ticket);
        break;
    }

    if (assignee) {
      ticket.assignedToId = assignee.id;
      ticket.assignedTo = assignee;
      await this.ticketRepository.save(ticket);

      this.logger.log(
        `Auto-assigned ticket ${ticket.ticketNumber} to ${assignee.fullname} using ${algorithm}`
      );

      // Notify via Slack
      await this.slackService.notifyAssignment(ticket).catch(err => {
        this.logger.error(`Failed to notify Slack of assignment: ${err.message}`);
      });
    }

    return ticket;
  }

  /**
   * Process unassigned tickets - runs every minute (if enabled)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processUnassignedTickets(): Promise<void> {
    // Skip if auto-assignment is disabled
    if (!this.autoAssignEnabled) {
      return;
    }

    this.logger.debug("Checking for unassigned tickets...");

    // Find unassigned open tickets
    const unassignedTickets = await this.ticketRepository.find({
      where: {
        assignedToId: IsNull(),
        status: In([TicketStatus.OPEN]),
      },
      relations: ["createdBy"],
      order: { createdAt: "ASC" },
      take: 10, // Process 10 at a time
    });

    if (unassignedTickets.length === 0) {
      return;
    }

    this.logger.log(`Found ${unassignedTickets.length} unassigned tickets`);

    for (const ticket of unassignedTickets) {
      await this.autoAssignTicket(ticket, "least-busy");
    }
  }

  /**
   * Get agent workload statistics
   */
  async getAgentWorkloadStats(): Promise<AgentWorkload[]> {
    return this.getAvailableAgents();
  }

  /**
   * Rebalance tickets among agents (manual trigger)
   */
  async rebalanceTickets(): Promise<{ reassigned: number }> {
    const workloads = await this.getAvailableAgents();
    
    if (workloads.length < 2) {
      return { reassigned: 0 };
    }

    // Calculate average workload
    const totalTickets = workloads.reduce((sum, w) => sum + w.totalActive, 0);
    const avgWorkload = Math.ceil(totalTickets / workloads.length);

    let reassigned = 0;

    // Find overloaded agents
    for (const workload of workloads) {
      if (workload.totalActive > avgWorkload + 2) {
        // Agent is overloaded, find tickets to reassign
        const excessTickets = await this.ticketRepository.find({
          where: {
            assignedToId: workload.agent.id,
            status: TicketStatus.OPEN, // Only reassign open tickets
          },
          order: { createdAt: "DESC" },
          take: workload.totalActive - avgWorkload,
        });

        for (const ticket of excessTickets) {
          // Find least busy agent
          const leastBusy = workloads.find(w => 
            w.agent.id !== workload.agent.id && 
            w.totalActive < avgWorkload
          );

          if (leastBusy) {
            ticket.assignedToId = leastBusy.agent.id;
            await this.ticketRepository.save(ticket);
            reassigned++;
            leastBusy.totalActive++;

            this.logger.log(
              `Rebalanced ticket ${ticket.ticketNumber} from ${workload.agent.fullname} to ${leastBusy.agent.fullname}`
            );
          }
        }
      }
    }

    return { reassigned };
  }
}
