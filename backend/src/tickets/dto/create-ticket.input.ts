import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../common/enums/ticket-category.enum';

@InputType()
export class CreateTicketInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  description: string;

  @Field(() => TicketPriority, { nullable: true })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @Field(() => TicketCategory, { nullable: true })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @Field({ nullable: true })
  @IsOptional()
  workstationNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
