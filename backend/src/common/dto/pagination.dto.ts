import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Min, Max, IsOptional } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

export function createPaginatedResponse<T>(
  itemType: new () => T,
): new () => PaginatedResponse<T> {
  @ObjectType(`Paginated${itemType.name}Response`)
  class PaginatedResponseClass {
    @Field(() => [itemType])
    items: T[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;
  }

  return PaginatedResponseClass as new () => PaginatedResponse<T>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageInfo: PageInfo;
}

export function paginate<T>(
  items: T[],
  totalItems: number,
  paginationInput: PaginationInput,
): PaginatedResponse<T> {
  const page = paginationInput.page || 1;
  const limit = paginationInput.limit || 20;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    pageInfo: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
