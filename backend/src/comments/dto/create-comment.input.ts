import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsBoolean, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @Field()
  @IsUUID()
  ticketId: string;
}
