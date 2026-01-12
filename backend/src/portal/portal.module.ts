import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalService } from './portal.service';
import { PortalResolver } from './portal.resolver';
import { Ticket } from '../tickets/entities/ticket.entity';
import { KnowledgeArticle } from '../database/entities/knowledge-article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, KnowledgeArticle])],
  providers: [PortalService, PortalResolver],
  exports: [PortalService],
})
export class PortalModule {}
