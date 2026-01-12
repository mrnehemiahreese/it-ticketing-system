import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AssetType {
  COMPUTER = 'COMPUTER',
  LAPTOP = 'LAPTOP',
  MONITOR = 'MONITOR',
  PRINTER = 'PRINTER',
  PHONE = 'PHONE',
  TABLET = 'TABLET',
  OTHER = 'OTHER',
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

@ObjectType()
@Entity('assets')
@Index(['assetTag'], { unique: true })
@Index(['serialNumber'], { unique: true })
export class Asset {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  assetTag: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({
    type: 'varchar',
  })
  type: AssetType;

  @Field()
  @Column()
  manufacturer: string;

  @Field()
  @Column()
  model: string;

  @Field()
  @Column({ unique: true })
  serialNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  assignedToUserId?: string;

  @Field()
  @Column({
    type: 'varchar',
    default: AssetStatus.AVAILABLE,
  })
  status: AssetStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  purchaseDate?: Date;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  warrantyExpiryDate?: Date;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  notes?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
