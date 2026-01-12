import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { TicketStatistics, TicketPriorityStats, ActivityData, UserStatistics, AgentPerformance, TicketTrend } from './dashboard.types';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => TicketStatistics)
  @Roles(Role.ADMIN, Role.AGENT)
  async ticketStatistics(): Promise<TicketStatistics> {
    return this.dashboardService.getTicketStatistics();
  }

  @Query(() => TicketPriorityStats)
  @Roles(Role.ADMIN, Role.AGENT)
  async ticketsByPriority(): Promise<TicketPriorityStats> {
    return this.dashboardService.getTicketsByPriority();
  }

  @Query(() => ActivityData)
  @Roles(Role.ADMIN, Role.AGENT)
  async recentActivity(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<ActivityData> {
    return this.dashboardService.getRecentActivity(limit);
  }

  @Query(() => UserStatistics)
  @Roles(Role.ADMIN)
  async userStatistics(): Promise<UserStatistics> {
    return this.dashboardService.getUserStatistics();
  }

  @Query(() => [AgentPerformance])
  @Roles(Role.ADMIN, Role.AGENT)
  async agentPerformance(): Promise<AgentPerformance[]> {
    return this.dashboardService.getAgentPerformance();
  }

  @Query(() => [TicketTrend])
  @Roles(Role.ADMIN, Role.AGENT)
  async ticketTrends(
    @Args('days', { type: () => Int, nullable: true }) days?: number,
  ): Promise<TicketTrend[]> {
    return this.dashboardService.getTicketTrends(days);
  }

  @Query(() => Number)
  @Roles(Role.ADMIN, Role.AGENT)
  async averageResolutionTime(): Promise<number> {
    return this.dashboardService.getAverageResolutionTime();
  }
}
