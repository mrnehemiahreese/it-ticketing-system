import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentsService } from './attachments.service';
import { AttachmentsResolver } from './attachments.resolver';
import { AttachmentsController } from './attachments.controller';
import { Attachment } from './entities/attachment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { SlackModule } from '../slack/slack.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, Ticket]),
    forwardRef(() => SlackModule),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, AttachmentsResolver],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
