import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { StatusSubmisi } from "../entities/jawaban-tugas.entity";

export class CreateJawabanTugasDto {
	@IsNumber()
	tugasId: number;

	@IsOptional()
	@IsString()
	jawabanTeks?: string;

	@IsOptional()
	filePath?: string;
}

export class UpdateJawabanTugasDto {
	@IsOptional()
	@IsString()
	jawabanTeks?: string;

	@IsOptional()
	filePath?: string;
}

export class SubmitJawabanTugasDto {
	@IsOptional()
	@IsString()
	jawabanTeks?: string;

	@IsOptional()
	filePath?: string;
}

export class JawabanTugasResponseDto {
	id: number;
	jawabanTeks: string;
	filePath: string;
	statusSubmisi: StatusSubmisi;
	submittedAt: Date;
	isLate: boolean;
	tugasId: number;
	pesertaDidikId: number;
	createdAt: Date;
	updatedAt: Date;
}
