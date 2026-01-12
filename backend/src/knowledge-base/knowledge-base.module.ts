import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseResolver } from './knowledge-base.resolver';
import { KnowledgeArticle } from '../database/entities/knowledge-article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeArticle])],
  providers: [KnowledgeBaseService, KnowledgeBaseResolver],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
