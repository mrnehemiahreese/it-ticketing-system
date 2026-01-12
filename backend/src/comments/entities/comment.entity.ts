import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@ObjectType()
@Entity('comments')
@Index(['ticketId'])
@Index(['userId'])
export class Comment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text')
  content: string;

  @Field()
  @Column({ default: false })
  isInternal: boolean;

  @Field()
  @Column()
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column()
  ticketId: string;

  @Field(() => Ticket)
  @ManyToOne(() => Ticket, (ticket) => ticket.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
