import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../common/enums/ticket-category.enum';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

@ObjectType()
@Entity('tickets')
@Index(['status'])
@Index(['priority'])
@Index(['createdById'])
@Index(['assignedToId'])
export class Ticket {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  ticketNumber: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => TicketStatus)
  @Column({
    type: 'varchar',
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Field(() => TicketPriority)
  @Column({
    type: 'varchar',
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Field(() => TicketCategory)
  @Column({
    type: 'varchar',
    default: TicketCategory.OTHER,
  })
  category: TicketCategory;

  @Field({ nullable: true })
  @Column({ nullable: true })
  workstationNumber?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  slackThreadTs?: string;

  @Field()
  @Column()
  createdById: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.createdTickets, { eager: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  assignedToId?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.assignedTickets, { eager: true, nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.ticket, { cascade: true })
  comments?: Comment[];

  @Field(() => [Attachment], { nullable: true })
  @OneToMany(() => Attachment, (attachment) => attachment.ticket, { cascade: true })
  attachments?: Attachment[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  resolvedAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  closedAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  archivedAt?: Date;

  // SLA-related fields
  @Field({ nullable: true })
  @Column({ nullable: true })
  slaPolicyId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  slaResponseDueAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  slaResolutionDueAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  slaResponseMetAt?: Date;

  @Field({ nullable: true })
  @Column({ default: false })
  slaBreached?: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  escalatedAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  escalatedToId?: string;
}
