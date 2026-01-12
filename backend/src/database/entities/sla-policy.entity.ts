import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';

@ObjectType()
@Entity('sla_policies')
export class SLAPolicy {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => TicketPriority)
  @Column({
    type: 'varchar',
  })
  priority: TicketPriority;

  @Field(() => Int)
  @Column()
  responseTimeHours: number;

  @Field(() => Int)
  @Column()
  resolutionTimeHours: number;

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
