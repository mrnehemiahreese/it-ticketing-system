import { Resolver, Query, Mutation, Args, Subscription, Int } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { TicketWatcher } from './entities/ticket-watcher.entity';
import { CreateTicketInput } from './dto/create-ticket.input';
import { UpdateTicketInput } from './dto/update-ticket.input';
import { TicketFiltersInput } from './dto/ticket-filters.input';
import { PaginatedTicketsResponse } from './dto/paginated-tickets.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PUB_SUB } from '../pubsub/pubsub.module';

export const TICKET_UPDATED_EVENT = 'ticketUpdated';
export const NEW_TICKET_EVENT = 'newTicket';

@Resolver(() => Ticket)
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsResolver {
  constructor(
    private readonly ticketsService: TicketsService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

  @Mutation(() => Ticket)
  async createTicket(
    @Args('createTicketInput') createTicketInput: CreateTicketInput,
    @CurrentUser() user: User,
  ): Promise<Ticket> {
    const ticket = await this.ticketsService.create(createTicketInput, user.id);
    await this.pubSub.publish(NEW_TICKET_EVENT, { newTicket: ticket });
    return ticket;
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
    const ticket = await this.ticketsService.update(id, updateTicketInput, user);
    await this.pubSub.publish(TICKET_UPDATED_EVENT, { ticketUpdated: ticket });
    return ticket;
  }

  @Mutation(() => Ticket)
  async assignTicket(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
    @CurrentUser() user: User,
  ): Promise<Ticket> {
    const ticket = await this.ticketsService.assignTicket(ticketId, userId, user);
    await this.pubSub.publish(TICKET_UPDATED_EVENT, { ticketUpdated: ticket });
    return ticket;
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

  @Mutation(() => Ticket)
  async userMarkResolved(
    @Args("ticketId") ticketId: string,
    @CurrentUser() user: User,
  ): Promise<Ticket> {
    const ticket = await this.ticketsService.userMarkResolved(ticketId, user);
    await this.pubSub.publish(TICKET_UPDATED_EVENT, { ticketUpdated: ticket });
    return ticket;
  }


  @Query(() => PaginatedTicketsResponse, { name: 'ticketsPaginated' })
  async findAllPaginated(
    @CurrentUser() user: User,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('filters', { nullable: true }) filters?: TicketFiltersInput,
  ): Promise<PaginatedTicketsResponse> {
    const { items, totalItems } = await this.ticketsService.findAllPaginated(
      filters,
      user,
      page,
      Math.min(limit, 100), // Max 100 items per page
    );
    
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      items,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  @Subscription(() => Ticket, {
    name: 'ticketUpdated',
    filter: (payload, variables) => {
      return payload.ticketUpdated.id === variables.ticketId;
    },
    resolve: (value) => value.ticketUpdated,
  })
  ticketUpdated(@Args('ticketId') ticketId: string) {
    return this.pubSub.asyncIterator([TICKET_UPDATED_EVENT]);
  }


  @Subscription(() => Ticket, {
    name: 'newTicket',
    resolve: (value) => value.newTicket,
  })
  newTicket() {
    return this.pubSub.asyncIterator([NEW_TICKET_EVENT]);
  }
}
