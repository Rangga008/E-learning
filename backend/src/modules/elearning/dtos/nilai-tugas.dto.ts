import { IsString, IsNumber, IsOptional, IsDecimal } from "class-validator";

export class CreateNilaiTugasDto {
	@IsNumber()
	jawabanTugasId: number;

	@IsDecimal({ decimal_digits: "1,2" })
	nilai: number;

	@IsOptional()
	@IsString()
	feedback?: string;
}

export class UpdateNilaiTugasDto {
	@IsOptional()
	@IsDecimal({ decimal_digits: "1,2" })
	nilai?: number;

	@IsOptional()
	@IsString()
	feedback?: string;
}

export class NilaiTugasResponseDto {
	id: number;
	nilai: number;
	feedback: string;
	gradedAt: Date;
	jawabanTugasId: number;
	guruId: number;
	createdAt: Date;
	updatedAt: Date;
}
