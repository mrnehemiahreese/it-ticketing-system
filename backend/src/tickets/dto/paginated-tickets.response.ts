import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Ticket } from '../entities/ticket.entity';

@ObjectType()
export class TicketPageInfo {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

@ObjectType()
export class PaginatedTicketsResponse {
  @Field(() => [Ticket])
  items: Ticket[];

  @Field(() => TicketPageInfo)
  pageInfo: TicketPageInfo;
}
