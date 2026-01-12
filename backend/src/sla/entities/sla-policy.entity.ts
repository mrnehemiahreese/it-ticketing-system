import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@ObjectType()
@Entity()
export class SlaPolicy {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description: string;

  @Field()
  @Column()
  priority: string;

  @Field(() => Int)
  @Column()
  responseTimeMinutes: number;

  @Field(() => Int)
  @Column()
  resolutionTimeMinutes: number;

  @Field()
  @Column({ default: true })
  escalationEnabled: boolean;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  escalationAfterMinutes: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "escalationToUserId" })
  escalationToUser: User;

  @Column({ nullable: true })
  escalationToUserId: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
