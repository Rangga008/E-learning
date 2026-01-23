import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";

export class CreateMateriDto {
	@IsNumber()
	mataPelajaranId: number;

	@IsNumber()
	guruId: number;

	@IsString()
	materiPokok: string;

	@IsString()
	konten: string;

	@IsOptional()
	@IsString()
	gambar?: string;

	@IsOptional()
	@IsBoolean()
	isPublished?: boolean;
}
