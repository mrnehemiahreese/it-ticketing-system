import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsEnum, IsInt, Min } from 'class-validator';
import { TicketCategory } from '../../common/enums/ticket-category.enum';

@InputType()
export class FilterKnowledgeArticlesInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => TicketCategory, { nullable: true })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
