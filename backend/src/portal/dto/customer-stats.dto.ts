import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { KnowledgeArticle } from '../../database/entities/knowledge-article.entity';

@ObjectType()
export class CustomerStats {
  @Field(() => Int)
  totalTickets: number;

  @Field(() => Int)
  openTickets: number;

  @Field(() => Int)
  inProgressTickets: number;

  @Field(() => Int)
  resolvedTickets: number;

  @Field(() => Int)
  closedTickets: number;

  @Field(() => Float, { nullable: true })
  avgResponseTime?: number;

  @Field(() => Float, { nullable: true })
  avgResolutionTime?: number;
}

@ObjectType()
export class CustomerDashboard {
  @Field(() => CustomerStats)
  stats: CustomerStats;

  @Field(() => [Ticket])
  recentTickets: Ticket[];

  @Field(() => [KnowledgeArticle])
  popularArticles: KnowledgeArticle[];
}
