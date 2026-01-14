import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoriesService } from "./categories.service";
import { CategoriesResolver } from "./categories.resolver";
import { TicketCategory } from "./entities/ticket-category.entity";
import { Ticket } from "../tickets/entities/ticket.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TicketCategory, Ticket])],
  providers: [CategoriesService, CategoriesResolver],
  exports: [CategoriesService],
})
export class CategoriesModule {}
