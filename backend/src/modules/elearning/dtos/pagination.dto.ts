import { IsOptional, IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";

/**
 * Pagination Query DTO
 * Provides standardized pagination for list endpoints
 * Usage: @Query() paginationDto: PaginationQueryDto
 */
export class PaginationQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	@Max(100)
	limit?: number = 10;

	/**
	 * Calculate skip value for TypeORM skip/take pattern
	 */
	getSkip(): number {
		return ((this.page || 1) - 1) * (this.limit || 10);
	}

	/**
	 * Get take value (alias for limit)
	 */
	getTake(): number {
		return this.limit || 10;
	}
}

/**
 * Paginated Response DTO
 * Wraps paginated results with metadata
 */
export class PaginatedResponseDto<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};

	constructor(data: T[], page: number, limit: number, total: number) {
		this.data = data;
		const totalPages = Math.ceil(total / limit);
		this.pagination = {
			page,
			limit,
			total,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		};
	}
}
