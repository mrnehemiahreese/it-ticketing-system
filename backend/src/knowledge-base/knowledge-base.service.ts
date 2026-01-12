import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { KnowledgeArticle } from '../database/entities/knowledge-article.entity';
import { CreateKnowledgeArticleInput } from './dto/create-knowledge-article.dto';
import { UpdateKnowledgeArticleInput } from './dto/update-knowledge-article.dto';
import { FilterKnowledgeArticlesInput } from './dto/filter-knowledge-articles.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeArticle)
    private knowledgeArticleRepository: Repository<KnowledgeArticle>,
  ) {}

  async create(
    input: CreateKnowledgeArticleInput,
    author: User,
  ): Promise<KnowledgeArticle> {
    const slug = this.generateSlug(input.title);

    const article = this.knowledgeArticleRepository.create({
      ...input,
      slug,
      authorId: author.id,
      isPublished: input.isPublished ?? true,
    });

    return this.knowledgeArticleRepository.save(article);
  }

  async findAll(filter?: FilterKnowledgeArticlesInput): Promise<KnowledgeArticle[]> {
    const query = this.knowledgeArticleRepository.createQueryBuilder('article');

    // Only show published articles for non-admin users
    query.where('article.isPublished = :isPublished', { isPublished: true });

    // Full-text search on title and content
    if (filter?.search) {
      query.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    // Filter by category
    if (filter?.category) {
      query.andWhere('article.category = :category', { category: filter.category });
    }

    // Filter by tags (any tag matches)
    if (filter?.tags && filter.tags.length > 0) {
      query.andWhere('article.tags && :tags', { tags: filter.tags });
    }

    // Order by views (most popular first) then by creation date
    query.orderBy('article.views', 'DESC');
    query.addOrderBy('article.createdAt', 'DESC');

    // Pagination
    if (filter?.limit) {
      query.take(filter.limit);
    }
    if (filter?.offset) {
      query.skip(filter.offset);
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<KnowledgeArticle> {
    const article = await this.knowledgeArticleRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Knowledge article not found');
    }

    return article;
  }

  async findBySlug(slug: string): Promise<KnowledgeArticle> {
    const article = await this.knowledgeArticleRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Knowledge article not found');
    }

    return article;
  }

  async update(
    id: string,
    input: UpdateKnowledgeArticleInput,
  ): Promise<KnowledgeArticle> {
    const article = await this.findOne(id);

    // Update slug if title changed
    if (input.title && input.title !== article.title) {
      article.slug = this.generateSlug(input.title);
    }

    Object.assign(article, input);

    return this.knowledgeArticleRepository.save(article);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.knowledgeArticleRepository.delete(id);
    return result.affected > 0;
  }

  async incrementViews(id: string): Promise<KnowledgeArticle> {
    const article = await this.findOne(id);
    article.views += 1;
    return this.knowledgeArticleRepository.save(article);
  }

  async rateHelpful(id: string, helpful: boolean): Promise<KnowledgeArticle> {
    const article = await this.findOne(id);

    if (helpful) {
      article.helpfulCount += 1;
    }

    return this.knowledgeArticleRepository.save(article);
  }

  async getPopular(limit: number = 5): Promise<KnowledgeArticle[]> {
    return this.knowledgeArticleRepository.find({
      where: { isPublished: true },
      order: { views: 'DESC' },
      take: limit,
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now();
  }
}
