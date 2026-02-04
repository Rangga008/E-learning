import {
	IsString,
	IsNumber,
	IsOptional,
	IsEnum,
	IsArray,
	IsDateString,
} from "class-validator";
import { MateriStatus, TipeKonten } from "../entities/materi.entity";

export class CreateMateriDto {
	@IsNumber()
	mataPelajaranId: number;

	@IsOptional()
	@IsNumber()
	guruId?: number;

	@IsString()
	judulMateri: string;

	@IsOptional()
	@IsString()
	deskripsi?: string;

	@IsEnum(TipeKonten)
	tipeKonten: TipeKonten;

	@IsOptional()
	@IsString()
	kontenTeks?: string;

	@IsOptional()
	filePath?: string;

	@IsOptional()
	@IsEnum(MateriStatus)
	status?: MateriStatus = MateriStatus.DRAFT;

	@IsOptional()
	@IsNumber()
	urutan?: number = 0;
}

export class UpdateMateriDto {
	@IsOptional()
	@IsString()
	judulMateri?: string;

	@IsOptional()
	@IsString()
	deskripsi?: string;

	@IsOptional()
	@IsEnum(TipeKonten)
	tipeKonten?: TipeKonten;

	@IsOptional()
	@IsString()
	kontenTeks?: string;

	@IsOptional()
	filePath?: string;

	@IsOptional()
	@IsEnum(MateriStatus)
	status?: MateriStatus;

	@IsOptional()
	@IsNumber()
	urutan?: number;
}

export class MateriResponseDto {
	id: number;
	judulMateri: string;
	deskripsi: string;
	tipeKonten: TipeKonten;
	kontenTeks: string;
	filePath: string;
	status: MateriStatus;
	urutan: number;
	guruId: number;
	mataPelajaranId: number;
	createdAt: Date;
	updatedAt: Date;
}
