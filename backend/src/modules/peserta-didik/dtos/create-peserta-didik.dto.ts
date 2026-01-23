import { IsString, IsOptional, IsNumber } from "class-validator";

export class CreatePesertaDidikDto {
	@IsString()
	nipd: string;

	@IsString()
	nisn: string;

	@IsString()
	namaLengkap: string;

	@IsString()
	jenisKelamin: string;

	@IsOptional()
	@IsNumber()
	kelasId?: number;

	@IsOptional()
	userId?: number;
}
