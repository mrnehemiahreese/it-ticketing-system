import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Comment } from '../comments/entities/comment.entity';

@ObjectType()
export class StatusCount {
  @Field(() => Int)
  open: number;

  @Field(() => Int)
  inProgress: number;

  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  resolved: number;

  @Field(() => Int)
  closed: number;

  @Field(() => Int)
  reopened: number;
}

@ObjectType()
export class TicketStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => StatusCount)
  byStatus: StatusCount;
}

@ObjectType()
export class TicketPriorityStats {
  @Field(() => Int)
  low: number;

  @Field(() => Int)
  medium: number;

  @Field(() => Int)
  high: number;

  @Field(() => Int)
  urgent: number;
}

@ObjectType()
export class ActivityData {
  @Field(() => [Ticket])
  recentTickets: Ticket[];

  @Field(() => [Comment])
  recentComments: Comment[];
}

@ObjectType()
export class UserStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  disabled: number;
}

@ObjectType()
export class AgentInfo {
  @Field()
  id: string;

  @Field()
  fullname: string;

  @Field()
  email: string;
}

@ObjectType()
export class AgentPerformance {
  @Field(() => AgentInfo)
  agent: AgentInfo;

  @Field(() => Int)
  assigned: number;

  @Field(() => Int)
  resolved: number;

  @Field(() => Int)
  closed: number;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class TicketTrend {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class TicketSourceStats {
  @Field(() => Int)
  portal: number;

  @Field(() => Int)
  email: number;

  @Field(() => Int)
  slack: number;
}
