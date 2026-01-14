import { InputType, Field, ID, Int, PartialType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsUUID, IsBoolean } from "class-validator";
import { CreateCategoryInput } from "./create-category.input";

@InputType()
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
