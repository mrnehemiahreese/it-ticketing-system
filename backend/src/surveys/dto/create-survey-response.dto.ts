import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

@InputType()
export class CreateSurveyResponseInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  feedback?: string;
}
