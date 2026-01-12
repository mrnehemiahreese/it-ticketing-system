import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsArray, IsOptional, IsPhoneNumber } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field()
  @IsNotEmpty()
  fullname: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  workstationNumber?: string;

  @Field(() => [Role])
  @IsArray()
  roles: Role[];
}
