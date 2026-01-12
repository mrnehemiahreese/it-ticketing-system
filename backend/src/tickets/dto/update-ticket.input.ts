import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { CreateTicketInput } from './create-ticket.input';
import { TicketStatus } from '../../common/enums/ticket-status.enum';

@InputType()
export class UpdateTicketInput extends PartialType(CreateTicketInput) {
  @Field(() => TicketStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
