import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from './slack.service';
import { SlackController } from './slack.controller';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Ticket, Comment, User]),
  ],
  providers: [SlackService],
  controllers: [SlackController],
  exports: [SlackService],
})
export class SlackModule {}
