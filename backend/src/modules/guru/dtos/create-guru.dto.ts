import { IsString, IsOptional, IsNumber } from "class-validator";

export class CreateGuruDto {
	@IsString()
	nip: string;

	@IsString()
	namaLengkap: string;

	@IsOptional()
	@IsNumber()
	mataPelajaranId?: number;

	@IsOptional()
	userId?: number;
}
