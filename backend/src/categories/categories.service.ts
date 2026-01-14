import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { TicketCategory } from "./entities/ticket-category.entity";
import { CreateCategoryInput } from "./dto/create-category.input";
import { UpdateCategoryInput } from "./dto/update-category.input";
import { Ticket } from "../tickets/entities/ticket.entity";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(TicketCategory)
    private categoryRepository: Repository<TicketCategory>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async create(input: CreateCategoryInput): Promise<TicketCategory> {
    // Validate parent exists if provided
    if (input.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new BadRequestException("Parent category not found");
      }
    }

    // Get max sort order for the parent level
    const maxSort = await this.categoryRepository
      .createQueryBuilder("cat")
      .where(input.parentId ? "cat.parentId = :parentId" : "cat.parentId IS NULL", {
        parentId: input.parentId,
      })
      .select("MAX(cat.sortOrder)", "max")
      .getRawOne();

    const category = this.categoryRepository.create({
      ...input,
      sortOrder: input.sortOrder ?? (maxSort?.max ?? -1) + 1,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(includeInactive = false): Promise<TicketCategory[]> {
    const where = includeInactive ? {} : { isActive: true };
    
    return this.categoryRepository.find({
      where,
      relations: ["parent", "children"],
      order: { sortOrder: "ASC", name: "ASC" },
    });
  }

  async findTopLevel(includeInactive = false): Promise<TicketCategory[]> {
    const query = this.categoryRepository
      .createQueryBuilder("cat")
      .leftJoinAndSelect("cat.children", "children")
      .where("cat.parentId IS NULL")
      .orderBy("cat.sortOrder", "ASC")
      .addOrderBy("cat.name", "ASC");

    if (!includeInactive) {
      query.andWhere("cat.isActive = :active", { active: true });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<TicketCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async findByParent(parentId: string | null, includeInactive = false): Promise<TicketCategory[]> {
    const where: any = includeInactive ? {} : { isActive: true };
    
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = IsNull();
    }

    return this.categoryRepository.find({
      where,
      relations: ["children"],
      order: { sortOrder: "ASC", name: "ASC" },
    });
  }

  async update(input: UpdateCategoryInput): Promise<TicketCategory> {
    const category = await this.findOne(input.id);

    // Prevent circular reference
    if (input.parentId && input.parentId === input.id) {
      throw new BadRequestException("Category cannot be its own parent");
    }

    // Validate new parent exists and is not a descendant
    if (input.parentId) {
      const newParent = await this.findOne(input.parentId);
      if (await this.isDescendant(input.id, input.parentId)) {
        throw new BadRequestException("Cannot move category under its own descendant");
      }
    }

    Object.assign(category, input);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<boolean> {
    const category = await this.findOne(id);

    // Check if category has tickets
    const ticketCount = await this.ticketRepository.count({
      where: { categoryId: id },
    });

    if (ticketCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${ticketCount} ticket(s). Reassign tickets first or deactivate the category.`
      );
    }

    // Move children to parent (or make them top-level)
    if (category.children && category.children.length > 0) {
      await this.categoryRepository.update(
        { parentId: id },
        { parentId: category.parentId || null }
      );
    }

    await this.categoryRepository.remove(category);
    return true;
  }

  async reorder(categoryId: string, newSortOrder: number): Promise<TicketCategory> {
    const category = await this.findOne(categoryId);
    category.sortOrder = newSortOrder;
    return this.categoryRepository.save(category);
  }

  // Analytics methods
  async getCategoryStats(startDate?: Date, endDate?: Date): Promise<any[]> {
    const query = this.ticketRepository
      .createQueryBuilder("ticket")
      .leftJoin("ticket_categories", "cat", "ticket.categoryId = cat.id")
      .select("cat.id", "categoryId")
      .addSelect("cat.name", "categoryName")
      .addSelect("cat.parentId", "parentId")
      .addSelect("COUNT(ticket.id)", "ticketCount")
      .groupBy("cat.id")
      .addGroupBy("cat.name")
      .addGroupBy("cat.parentId")
      .orderBy("COUNT(ticket.id)", "DESC");

    if (startDate) {
      query.andWhere("ticket.createdAt >= :startDate", { startDate });
    }
    if (endDate) {
      query.andWhere("ticket.createdAt <= :endDate", { endDate });
    }

    return query.getRawMany();
  }

  async getCategoryBreakdown(): Promise<any> {
    // Get all categories with ticket counts
    const stats = await this.ticketRepository
      .createQueryBuilder("ticket")
      .leftJoin("ticket_categories", "cat", "ticket.categoryId = cat.id")
      .leftJoin("ticket_categories", "parent", "cat.parentId = parent.id")
      .select("COALESCE(parent.name, cat.name)", "topCategory")
      .addSelect("cat.name", "subCategory")
      .addSelect("COUNT(ticket.id)", "count")
      .groupBy("COALESCE(parent.name, cat.name)")
      .addGroupBy("cat.name")
      .orderBy("count", "DESC")
      .getRawMany();

    return stats;
  }

  async getTopCategories(limit = 10): Promise<any[]> {
    return this.ticketRepository
      .createQueryBuilder("ticket")
      .leftJoin("ticket_categories", "cat", "ticket.categoryId = cat.id")
      .select("cat.id", "categoryId")
      .addSelect("cat.name", "categoryName")
      .addSelect("COUNT(ticket.id)", "ticketCount")
      .groupBy("cat.id")
      .addGroupBy("cat.name")
      .orderBy("COUNT(ticket.id)", "DESC")
      .limit(limit)
      .getRawMany();
  }

  // Helper to check if a category is a descendant of another
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    let current = await this.categoryRepository.findOne({
      where: { id: descendantId },
    });

    while (current && current.parentId) {
      if (current.parentId === ancestorId) {
        return true;
      }
      current = await this.categoryRepository.findOne({
        where: { id: current.parentId },
      });
    }

    return false;
  }

  // Get hierarchical tree structure
  async getCategoryTree(): Promise<TicketCategory[]> {
    const allCategories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: "ASC", name: "ASC" },
    });

    // Build tree structure
    const categoryMap = new Map<string, TicketCategory>();
    const rootCategories: TicketCategory[] = [];

    // First pass: create map
    allCategories.forEach((cat) => {
      cat.children = [];
      categoryMap.set(cat.id, cat);
    });

    // Second pass: build tree
    allCategories.forEach((cat) => {
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children!.push(cat);
      } else if (!cat.parentId) {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }
}
