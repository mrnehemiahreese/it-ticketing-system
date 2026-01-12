import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

@InputType()
export class CreateAttachmentInput {
  @Field()
  @IsNotEmpty()
  filename: string;

  @Field()
  @IsNotEmpty()
  filepath: string;

  @Field()
  @IsNotEmpty()
  mimetype: string;

  @Field(() => Int)
  @IsNumber()
  size: number;

  @Field()
  @IsUUID()
  ticketId: string;
}
