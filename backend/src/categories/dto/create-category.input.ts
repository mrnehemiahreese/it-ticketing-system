import { InputType, Field, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsUUID, IsInt, Min, MaxLength } from "class-validator";

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(20)
  color?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
