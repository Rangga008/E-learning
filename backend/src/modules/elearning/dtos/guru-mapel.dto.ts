import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";

export class CreateGuruMapelDto {
	@IsNumber()
	guruId: number;

	@IsNumber()
	mataPelajaranId: number;
}

export class GuruMapelResponseDto {
	id: number;
	guruId: number;
	mataPelajaranId: number;
	createdAt: Date;
}
