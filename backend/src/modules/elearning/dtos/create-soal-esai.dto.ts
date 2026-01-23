import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateSoalEsaiDto {
	@IsNumber()
	materiEsaiId: number;

	@IsString()
	soal: string; // Pertanyaan/instruksi soal

	@IsOptional()
	@IsString()
	pedomanPenilaian?: string; // Rubrik penilaian (opsional)
}
