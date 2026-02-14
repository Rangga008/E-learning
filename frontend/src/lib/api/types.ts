/**
 * API Error handling types
 */

export class APIError extends Error {
	constructor(
		message: string,
		public status: number,
		public code: string,
		public details?: any,
	) {
		super(message);
		this.name = "APIError";
	}
}

export interface APIResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	code?: string;
}

export type APIPaginatedResponse<T = any> = APIResponse<T[]> & {
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};
