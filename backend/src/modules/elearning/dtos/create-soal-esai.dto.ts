import { IsString, IsNumber, IsOptional } from "class-validator";

/**
 * CreateSoalEsaiDto
 *
 * Creates an essay question that belongs to either:
 * - A learning material (materiId) - for material questions
 * - A task/quiz (tugasId) - for task/quiz questions
 *
 * Exactly ONE of materiId or tugasId must be provided.
 */
export class CreateSoalEsaiDto {
	@IsNumber()
	@IsOptional()
	materiId?: number; // For material questions

	@IsNumber()
	@IsOptional()
	tugasId?: number; // For task/quiz questions

	@IsString()
	pertanyaan: string; // Question text

	@IsOptional()
	@IsNumber()
	bobot?: number; // Weight/points for scoring
}
