import { IsString, IsEnum, IsOptional } from "class-validator";
import { TipeKontenMateri } from "../entities/konten.entity";

export class CreateKontenDto {
	@IsEnum(TipeKontenMateri)
	tipeKonten: TipeKontenMateri;

	@IsString()
	judul: string;

	@IsOptional()
	@IsString()
	kontenTeks?: string;

	@IsOptional()
	@IsString()
	linkVideo?: string;

	@IsOptional()
	@IsString()
	filePath?: string;
}

export class UpdateKontenDto {
	@IsOptional()
	@IsEnum(TipeKontenMateri)
	tipeKonten?: TipeKontenMateri;

	@IsOptional()
	@IsString()
	judul?: string;

	@IsOptional()
	@IsString()
	kontenTeks?: string;

	@IsOptional()
	@IsString()
	linkVideo?: string;

	@IsOptional()
	@IsString()
	filePath?: string;
}
