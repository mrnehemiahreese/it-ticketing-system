import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from './slack.service';
import { SlackController } from './slack.controller';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Attachment } from '../attachments/entities/attachment.entity';
import { PubSubModule } from '../pubsub/pubsub.module';
import { EmailModule } from '../notifications/email.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Ticket, Comment, User, Attachment]),
    PubSubModule,
    forwardRef(() => EmailModule),
  ],
  providers: [SlackService],
  controllers: [SlackController],
  exports: [SlackService],
})
export class SlackModule {}
