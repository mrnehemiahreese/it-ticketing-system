import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { TicketCategory } from '../../common/enums/ticket-category.enum';

@InputType()
export class CreateKnowledgeArticleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => TicketCategory)
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @Field(() => [String])
  @IsArray()
  tags: string[];

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
