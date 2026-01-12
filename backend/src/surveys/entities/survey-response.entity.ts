import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity('survey_responses')
@Index(['ticketId', 'userId'], { unique: true })
export class SurveyResponse {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  ticketId: string;

  @Field(() => Ticket)
  @ManyToOne(() => Ticket, { eager: true })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Field()
  @Column()
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Int)
  @Column({ type: 'int' })
  rating: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  feedback?: string;

  // Not exposed in GraphQL schema, only in DB
  @Column({ type: 'jsonb', nullable: true })
  answers?: Record<string, any>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
