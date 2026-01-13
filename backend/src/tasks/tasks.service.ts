import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TicketsService } from "../tickets/tickets.service";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly ticketsService: TicketsService) {}

  // Run every hour to check for tickets to archive
  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoArchive() {
    this.logger.log("Running auto-archive task...");
    
    try {
      const archivedCount = await this.ticketsService.autoArchiveClosedTickets();
      
      if (archivedCount > 0) {
        this.logger.log(`Auto-archived ${archivedCount} ticket(s) that were closed for 10+ hours`);
      }
    } catch (error) {
      this.logger.error("Error during auto-archive:", error.message);
    }
  }
}
