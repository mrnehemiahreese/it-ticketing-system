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
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@ObjectType()
@Entity('attachments')
@Index(['ticketId'])
@Index(['uploadedById'])
export class Attachment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  filename: string;

  @Field()
  @Column()
  filepath: string;

  @Field()
  @Column()
  mimetype: string;

  @Field(() => Int)
  @Column()
  size: number;

  @Field()
  @Column()
  ticketId: string;

  @Field(() => Ticket)
  @ManyToOne(() => Ticket, (ticket) => ticket.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Field()
  @Column()
  uploadedById: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.attachments, { eager: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
