import {
	IsString,
	IsNumber,
	IsOptional,
	IsEnum,
	IsArray,
	IsDateString,
} from "class-validator";
import { TugasStatus } from "../entities/tugas.entity";

export class CreateTugasDto {
	@IsNumber()
	materiId: number;

	@IsString()
	judulTugas: string;

	@IsString()
	deskripsi: string;

	@IsString()
	tipe: string;

	@IsArray()
	@IsString({ each: true })
	tipeSubmisi: string[];

	@IsDateString()
	tanggalBuka: string;

	@IsOptional()
	@IsDateString()
	tanggalDeadline?: string;

	@IsOptional()
	@IsNumber()
	nilaiMaksimal?: number = 100;

	@IsOptional()
	@IsString()
	instruksiTambahan?: string;

	@IsOptional()
	@IsEnum(TugasStatus)
	status?: TugasStatus = TugasStatus.DRAFT;
}

export class UpdateTugasDto {
	@IsOptional()
	@IsString()
	judulTugas?: string;

	@IsOptional()
	@IsString()
	deskripsi?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tipeSubmisi?: string[];

	@IsOptional()
	@IsDateString()
	tanggalBuka?: string;

	@IsOptional()
	@IsDateString()
	tanggalDeadline?: string;

	@IsOptional()
	@IsNumber()
	nilaiMaksimal?: number;

	@IsOptional()
	@IsString()
	instruksiTambahan?: string;

	@IsOptional()
	@IsEnum(TugasStatus)
	status?: TugasStatus;
}

export class TugasResponseDto {
	id: number;
	judulTugas: string;
	deskripsi: string;
	tipeSubmisi: string[];
	tanggalBuka: Date;
	tanggalDeadline: Date;
	status: TugasStatus;
	nilaiMaksimal: number;
	instruksiTambahan: string;
	filePath?: string;
	fileName?: string;
	fileType?: string;
	materiId: number;
	guruId: number;
	createdAt: Date;
	updatedAt: Date;
}
