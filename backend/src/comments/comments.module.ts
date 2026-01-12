import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { Comment } from './entities/comment.entity';
import { SlackModule } from '../slack/slack.module';
import { PubSubModule } from '../pubsub/pubsub.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), SlackModule, PubSubModule],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
