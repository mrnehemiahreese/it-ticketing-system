import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { TicketPriority } from '../common/enums/ticket-priority.enum';
import { TicketSource } from '../common/enums/ticket-source.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async getTicketStatistics() {
    const [
      total,
      open,
      inProgress,
      pending,
      resolved,
      closed,
      reopened,
    ] = await Promise.all([
      this.ticketsRepository.count(),
      this.ticketsRepository.count({ where: { status: TicketStatus.OPEN } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.PENDING } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.RESOLVED } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.CLOSED } }),
      this.ticketsRepository.count({ where: { status: TicketStatus.REOPENED } }),
    ]);

    return {
      total,
      byStatus: {
        open,
        inProgress,
        pending,
        resolved,
        closed,
        reopened,
      },
    };
  }

  async getTicketsByPriority() {
    const [low, medium, high, urgent] = await Promise.all([
      this.ticketsRepository.count({ where: { priority: TicketPriority.LOW } }),
      this.ticketsRepository.count({ where: { priority: TicketPriority.MEDIUM } }),
      this.ticketsRepository.count({ where: { priority: TicketPriority.HIGH } }),
      this.ticketsRepository.count({ where: { priority: TicketPriority.URGENT } }),
    ]);

    return {
      low,
      medium,
      high,
      urgent,
    };
  }

  async getRecentActivity(limit: number = 10) {
    const recentTickets = await this.ticketsRepository.find({
      relations: ['createdBy', 'assignedTo'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const recentComments = await this.commentsRepository.find({
      relations: ['user', 'ticket'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      recentTickets,
      recentComments,
    };
  }

  async getUserStatistics() {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({ where: { isDisabled: false } });
    const disabledUsers = await this.usersRepository.count({ where: { isDisabled: true } });

    return {
      total: totalUsers,
      active: activeUsers,
      disabled: disabledUsers,
    };
  }

  async getAgentPerformance() {
    const agents = await this.usersRepository
      .createQueryBuilder('user')
      .where("user.roles LIKE :role", { role: '%AGENT%' })
      .orWhere("user.roles LIKE :admin", { admin: '%ADMIN%' })
      .getMany();

    const performance = await Promise.all(
      agents.map(async (agent) => {
        const assigned = await this.ticketsRepository.count({
          where: { assignedToId: agent.id },
        });

        const resolved = await this.ticketsRepository.count({
          where: {
            assignedToId: agent.id,
            status: TicketStatus.RESOLVED,
          },
        });

        const closed = await this.ticketsRepository.count({
          where: {
            assignedToId: agent.id,
            status: TicketStatus.CLOSED,
          },
        });

        return {
          agent: {
            id: agent.id,
            fullname: agent.fullname,
            email: agent.email,
          },
          assigned,
          resolved,
          closed,
          total: resolved + closed,
        };
      })
    );

    return performance;
  }

  async getTicketTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const tickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .where('ticket.createdAt >= :startDate', { startDate })
      .orderBy('ticket.createdAt', 'ASC')
      .getMany();

    // Group by date
    const trendData = tickets.reduce((acc, ticket) => {
      const date = ticket.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trendData).map(([date, count]) => ({
      date,
      count: count as number,
    }));
  }

  async getAverageResolutionTime() {
    const resolvedTickets = await this.ticketsRepository.find({
      where: { status: TicketStatus.RESOLVED },
      select: ['createdAt', 'resolvedAt'],
    });

    if (resolvedTickets.length === 0) {
      return 0;
    }

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      if (ticket.resolvedAt) {
        const diff = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
        return sum + diff;
      }
      return sum;
    }, 0);

    // Return average in hours
    return totalTime / resolvedTickets.length / (1000 * 60 * 60);
  }

  async getTicketsBySource() {
    const [portal, email, slack] = await Promise.all([
      this.ticketsRepository.count({ where: { source: TicketSource.PORTAL } }),
      this.ticketsRepository.count({ where: { source: TicketSource.EMAIL } }),
      this.ticketsRepository.count({ where: { source: TicketSource.SLACK } }),
    ]);

    return { portal, email, slack };
  }
}
