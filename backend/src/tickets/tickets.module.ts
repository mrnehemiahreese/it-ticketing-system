import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsResolver } from './tickets.resolver';
import { Ticket } from './entities/ticket.entity';
import { TicketWatcher } from './entities/ticket-watcher.entity';
import { User } from '../users/entities/user.entity';
import { SlackModule } from '../slack/slack.module';
import { PubSubModule } from '../pubsub/pubsub.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketWatcher, User]), SlackModule, PubSubModule],
  providers: [TicketsService, TicketsResolver],
  exports: [TicketsService],
})
export class TicketsModule {}
