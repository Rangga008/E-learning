import { IsBoolean, IsOptional } from "class-validator";

export class NotifikasiResponseDto {
	id: number;
	pesertaDidikId: number;
	tipe: string;
	judul: string;
	pesan: string;
	tugasId: number;
	dibaca: boolean;
	createdAt: Date;
}

export class MarkNotifikasiAsReadDto {
	@IsOptional()
	@IsBoolean()
	dibaca?: boolean = true;
}
