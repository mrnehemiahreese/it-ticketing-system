import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { TicketCategory } from "./entities/ticket-category.entity";
import { CreateCategoryInput } from "./dto/create-category.input";
import { UpdateCategoryInput } from "./dto/update-category.input";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";

@Resolver(() => TicketCategory)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Public queries (authenticated users)
  @Query(() => [TicketCategory], { name: "categories" })
  @UseGuards(JwtAuthGuard)
  async getCategories(): Promise<TicketCategory[]> {
    return this.categoriesService.findAll(false);
  }

  @Query(() => [TicketCategory], { name: "categoryTree" })
  @UseGuards(JwtAuthGuard)
  async getCategoryTree(): Promise<TicketCategory[]> {
    return this.categoriesService.getCategoryTree();
  }

  @Query(() => [TicketCategory], { name: "topLevelCategories" })
  @UseGuards(JwtAuthGuard)
  async getTopLevelCategories(): Promise<TicketCategory[]> {
    return this.categoriesService.findTopLevel(false);
  }

  @Query(() => [TicketCategory], { name: "subCategories" })
  @UseGuards(JwtAuthGuard)
  async getSubCategories(
    @Args("parentId", { type: () => ID }) parentId: string
  ): Promise<TicketCategory[]> {
    return this.categoriesService.findByParent(parentId, false);
  }

  @Query(() => TicketCategory, { name: "category" })
  @UseGuards(JwtAuthGuard)
  async getCategory(
    @Args("id", { type: () => ID }) id: string
  ): Promise<TicketCategory> {
    return this.categoriesService.findOne(id);
  }

  // Admin queries
  @Query(() => [TicketCategory], { name: "allCategories" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllCategories(): Promise<TicketCategory[]> {
    return this.categoriesService.findAll(true);
  }

  // Admin mutations
  @Mutation(() => TicketCategory)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCategory(
    @Args("input") input: CreateCategoryInput
  ): Promise<TicketCategory> {
    return this.categoriesService.create(input);
  }

  @Mutation(() => TicketCategory)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCategory(
    @Args("input") input: UpdateCategoryInput
  ): Promise<TicketCategory> {
    return this.categoriesService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCategory(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.categoriesService.remove(id);
  }

  @Mutation(() => TicketCategory)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reorderCategory(
    @Args("id", { type: () => ID }) id: string,
    @Args("sortOrder") sortOrder: number
  ): Promise<TicketCategory> {
    return this.categoriesService.reorder(id, sortOrder);
  }

  // Analytics queries (Admin only)
  @Query(() => [CategoryStat], { name: "categoryStats" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  async getCategoryStats(
    @Args("startDate", { nullable: true }) startDate?: Date,
    @Args("endDate", { nullable: true }) endDate?: Date
  ): Promise<any[]> {
    return this.categoriesService.getCategoryStats(startDate, endDate);
  }

  @Query(() => [CategoryStat], { name: "topCategories" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  async getTopCategories(
    @Args("limit", { nullable: true, defaultValue: 10 }) limit: number
  ): Promise<any[]> {
    return this.categoriesService.getTopCategories(limit);
  }
}

// Helper type for stats
import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class CategoryStat {
  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  categoryName?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Int)
  ticketCount: number;
}
