import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { CustomerDashboard } from './dto/customer-stats.dto';
import { Ticket } from '../tickets/entities/ticket.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { TicketPriority } from '../common/enums/ticket-priority.enum';

@Resolver()
@UseGuards(JwtAuthGuard)
export class PortalResolver {
  constructor(private readonly portalService: PortalService) {}

  @Query(() => CustomerDashboard, { name: 'customerDashboard' })
  async getCustomerDashboard(@CurrentUser() user: User): Promise<CustomerDashboard> {
    return this.portalService.getCustomerDashboard(user);
  }

  @Query(() => [Ticket], { name: 'customerTickets' })
  async getCustomerTickets(
    @CurrentUser() user: User,
    @Args('status', { type: () => TicketStatus, nullable: true }) status?: TicketStatus,
    @Args('priority', { type: () => TicketPriority, nullable: true }) priority?: TicketPriority,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<Ticket[]> {
    return this.portalService.getCustomerTickets(user, status, priority, limit, offset);
  }
}
