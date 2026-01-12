import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TicketCategory } from '../../common/enums/ticket-category.enum';

@ObjectType()
@Entity('knowledge_articles')
@Index(['slug'], { unique: true })
@Index(['category'])
export class KnowledgeArticle {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field()
  @Column('text')
  content: string;

  @Field(() => TicketCategory)
  @Column({
    type: 'varchar',
  })
  category: TicketCategory;

  @Field(() => [String])
  @Column('simple-array')
  tags: string[];

  @Field()
  @Column()
  authorId: string;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Field(() => Int)
  @Column({ default: 0 })
  views: number;

  @Field(() => Int)
  @Column({ default: 0 })
  helpfulCount: number;

  @Field()
  @Column({ default: true })
  isPublished: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
