import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { Comment } from './entities/comment.entity';
import { SlackModule } from '../slack/slack.module';
import { EmailModule } from '../notifications/email.module';
import { Ticket } from '../tickets/entities/ticket.entity';
import { PubSubModule } from '../pubsub/pubsub.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Ticket]), SlackModule, PubSubModule, EmailModule],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
