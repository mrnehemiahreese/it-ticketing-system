import { InputType, Field } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsEnum, IsUUID } from "class-validator";
import { TicketPriority } from "../../common/enums/ticket-priority.enum";
import { TicketCategory } from "../../common/enums/ticket-category.enum";

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

  // Legacy category enum (deprecated)
  @Field(() => TicketCategory, { nullable: true, deprecationReason: "Use categoryId instead" })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  // New dynamic category reference
  @Field({ nullable: true, description: "ID of the dynamic category" })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  workstationNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
