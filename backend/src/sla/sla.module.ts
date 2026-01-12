import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SlaPolicy } from "./entities/sla-policy.entity";
import { SlaService } from "./sla.service";
import { SlaResolver } from "./sla.resolver";
import { AutoAssignmentService } from "./auto-assignment.service";
import { Ticket } from "../tickets/entities/ticket.entity";
import { User } from "../users/entities/user.entity";
import { SlackModule } from "../slack/slack.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SlaPolicy, Ticket, User]),
    forwardRef(() => SlackModule),
  ],
  providers: [SlaService, SlaResolver, AutoAssignmentService],
  exports: [SlaService, AutoAssignmentService],
})
export class SlaModule {}
