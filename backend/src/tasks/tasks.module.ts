import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TasksService } from "./tasks.service";
import { TicketsModule } from "../tickets/tickets.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TicketsModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
