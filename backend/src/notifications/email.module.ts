import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { EmailService } from "./email.service";
import { EmailInboundService } from "./email-inbound.service";
import { Ticket } from "../tickets/entities/ticket.entity";
import { User } from "../users/entities/user.entity";
import { Comment } from "../comments/entities/comment.entity";
import { SlackModule } from "../slack/slack.module";
import { PubSubModule } from "../pubsub/pubsub.module";
import { AttachmentsModule } from "../attachments/attachments.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, User, Comment]),
    ScheduleModule.forRoot(),
    forwardRef(() => SlackModule),
    PubSubModule,
    AttachmentsModule,
  ],
  providers: [EmailService, EmailInboundService],
  exports: [EmailService, EmailInboundService],
})
export class EmailModule {}
