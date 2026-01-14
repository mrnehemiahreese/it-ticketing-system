import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@ObjectType()
@Entity("ticket_categories")
@Index(["parentId"])
@Index(["isActive"])
export class TicketCategory {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field({ nullable: true })
  @Column({ length: 255, nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  icon?: string;

  @Field({ nullable: true })
  @Column({ length: 20, nullable: true })
  color?: string;

  @Field(() => Int)
  @Column({ default: 0 })
  sortOrder: number;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  parentId?: string;

  @Field(() => TicketCategory, { nullable: true })
  @ManyToOne(() => TicketCategory, (category) => category.children, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "parentId" })
  parent?: TicketCategory;

  @Field(() => [TicketCategory], { nullable: true })
  @OneToMany(() => TicketCategory, (category) => category.parent)
  children?: TicketCategory[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field for ticket count (populated by service)
  @Field(() => Int, { nullable: true })
  ticketCount?: number;
}
