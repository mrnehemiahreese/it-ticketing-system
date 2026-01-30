import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../common/enums/ticket-category.enum';

@InputType()
export class TicketFiltersInput {
  @Field(() => [TicketStatus], { nullable: true })
  @IsOptional()
  status?: TicketStatus[];

  @Field(() => [TicketPriority], { nullable: true })
  @IsOptional()
  priority?: TicketPriority[];

  @Field(() => [TicketCategory], { nullable: true })
  @IsOptional()
  category?: TicketCategory[];

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  includeArchived?: boolean;
}
