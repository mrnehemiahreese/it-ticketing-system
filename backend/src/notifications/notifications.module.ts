import { Module } from '@nestjs/common';
import { EmailModule } from './email.module';
import { SlackService } from './slack.service';

@Module({
  imports: [EmailModule],
  providers: [SlackService],
  exports: [EmailModule, SlackService],
})
export class NotificationsModule {}
