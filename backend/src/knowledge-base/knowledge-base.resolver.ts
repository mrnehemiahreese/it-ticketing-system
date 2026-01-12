import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeArticle } from '../database/entities/knowledge-article.entity';
import { CreateKnowledgeArticleInput } from './dto/create-knowledge-article.dto';
import { UpdateKnowledgeArticleInput } from './dto/update-knowledge-article.dto';
import { FilterKnowledgeArticlesInput } from './dto/filter-knowledge-articles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

@Resolver(() => KnowledgeArticle)
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseResolver {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Query(() => [KnowledgeArticle], { name: 'knowledgeArticles' })
  async findAll(
    @Args('filter', { nullable: true }) filter?: FilterKnowledgeArticlesInput,
  ): Promise<KnowledgeArticle[]> {
    return this.knowledgeBaseService.findAll(filter);
  }

  @Query(() => KnowledgeArticle, { name: 'knowledgeArticle' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<KnowledgeArticle> {
    // Increment view count when article is accessed
    return this.knowledgeBaseService.incrementViews(id);
  }

  @Query(() => [KnowledgeArticle], { name: 'popularKnowledgeArticles' })
  async getPopular(
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 5 }) limit: number,
  ): Promise<KnowledgeArticle[]> {
    return this.knowledgeBaseService.getPopular(limit);
  }

  @Mutation(() => KnowledgeArticle)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  async createKnowledgeArticle(
    @Args('input') input: CreateKnowledgeArticleInput,
    @CurrentUser() user: User,
  ): Promise<KnowledgeArticle> {
    return this.knowledgeBaseService.create(input, user);
  }

  @Mutation(() => KnowledgeArticle)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  async updateKnowledgeArticle(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateKnowledgeArticleInput,
  ): Promise<KnowledgeArticle> {
    return this.knowledgeBaseService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteKnowledgeArticle(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.knowledgeBaseService.remove(id);
  }

  @Mutation(() => KnowledgeArticle)
  async rateArticleHelpful(
    @Args('id', { type: () => ID }) id: string,
    @Args('helpful', { type: () => Boolean }) helpful: boolean,
  ): Promise<KnowledgeArticle> {
    return this.knowledgeBaseService.rateHelpful(id, helpful);
  }
}
