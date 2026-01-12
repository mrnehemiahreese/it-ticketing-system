import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@ObjectType()
@Entity('ticket_watchers')
@Index(['ticketId', 'userId'], { unique: true })
export class TicketWatcher {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  ticketId: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
