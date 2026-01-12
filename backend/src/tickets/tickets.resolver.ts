import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { TicketWatcher } from './entities/ticket-watcher.entity';
import { CreateTicketInput } from './dto/create-ticket.input';
import { UpdateTicketInput } from './dto/update-ticket.input';
import { TicketFiltersInput } from './dto/ticket-filters.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Ticket)
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsResolver {
  constructor(private readonly ticketsService: TicketsService) {}

  @Mutation(() => Ticket)
  async createTicket(
    @Args('createTicketInput') createTicketInput: CreateTicketInput,
    @CurrentUser() user: User,
  ): Promise<Ticket> {
    return this.ticketsService.create(createTicketInput, user.id);
  }

  @Query(() => [Ticket], { name: 'tickets' })
  async findAll(
    @CurrentUser() user: User,
    @Args('filters', { nullable: true }) filters?: TicketFiltersInput,
  ): Promise<Ticket[]> {
    return this.ticketsService.findAll(filters, user);
  }

  @Query(() => Ticket, { name: 'ticket' })
  async findOne(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Ticket> {
    return this.ticketsService.findOne(id, user);
  }

  @Query(() => [Ticket], { name: 'myTickets' })
  async findMyTickets(@CurrentUser() user: User): Promise<Ticket[]> {
    return this.ticketsService.findMyTickets(user.id);
  }

  @Mutation(() => Ticket)
  async updateTicket(
    @Args('id') id: string,
    @Args('updateTicketInput') updateTicketInput: UpdateTicketInput,
    @CurrentUser() user: User,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketInput, user);
  }

  @Mutation(() => Ticket)
  async assignTicket(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
    @CurrentUser() user: User,
  ): Promise<Ticket> {
    return this.ticketsService.assignTicket(ticketId, userId, user);
  }

  @Mutation(() => Boolean)
  async removeTicket(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.ticketsService.remove(id, user);
  }

  @Mutation(() => TicketWatcher)
  async addWatcher(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ): Promise<TicketWatcher> {
    return this.ticketsService.addWatcher(ticketId, userId);
  }

  @Mutation(() => Boolean)
  async removeWatcher(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ): Promise<boolean> {
    return this.ticketsService.removeWatcher(ticketId, userId);
  }

  @Query(() => [TicketWatcher])
  async ticketWatchers(@Args('ticketId') ticketId: string): Promise<TicketWatcher[]> {
    return this.ticketsService.getWatchers(ticketId);
  }
}
