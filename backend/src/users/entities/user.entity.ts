import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

@ObjectType()
@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['slackUserId'], { unique: true })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @HideField()
  @Column()
  password: string;

  @Field()
  @Column()
  fullname: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  workstationNumber?: string;

  @Field(() => [Role])
  @Column('simple-array')
  roles: Role[];

  @Field()
  @Column({ default: false })
  isDisabled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  slackUserId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  slackDisplayName?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Ticket], { nullable: true })
  @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
  createdTickets?: Ticket[];

  @Field(() => [Ticket], { nullable: true })
  @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
  assignedTickets?: Ticket[];

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.user)
  comments?: Comment[];

  @Field(() => [Attachment], { nullable: true })
  @OneToMany(() => Attachment, (attachment) => attachment.uploadedBy)
  attachments?: Attachment[];
}
