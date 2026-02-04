import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateSoalEsaiDto {
	@IsOptional()
	@IsString()
	soal?: string;

	@IsOptional()
	@IsString()
	pedomanPenilaian?: string;

	@IsOptional()
	@IsNumber()
	bobot?: number;
}

export class GradeJawabanEsaiDto {
	@IsNumber()
	nilai: number;

	@IsOptional()
	@IsString()
	catatanGuru?: string;
}

export class SubmitJawabanEsaiDto {
	@IsNumber()
	soalEsaiId: number;

	@IsString()
	jawaban: string;
}
