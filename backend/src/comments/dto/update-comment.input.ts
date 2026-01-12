import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class UpdateCommentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
