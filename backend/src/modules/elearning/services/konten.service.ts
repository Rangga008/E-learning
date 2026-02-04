import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KontenMateri } from "../entities/konten.entity";
import { CreateKontenDto, UpdateKontenDto } from "../dtos/konten.dto";
import { FileUploadService } from "./file-upload.service";

@Injectable()
export class KontenService {
	constructor(
		@InjectRepository(KontenMateri)
		private readonly kontenRepository: Repository<KontenMateri>,
		private readonly fileUploadService: FileUploadService,
	) {}

	async create(materiId: number, dto: CreateKontenDto): Promise<KontenMateri> {
		const konten = this.kontenRepository.create({
			materiId,
			...dto,
		});
		return this.kontenRepository.save(konten);
	}

	async findByMateriId(materiId: number): Promise<KontenMateri[]> {
		return this.kontenRepository.find({
			where: { materiId },
			order: { createdAt: "DESC" },
		});
	}

	async findById(id: number): Promise<KontenMateri> {
		const konten = await this.kontenRepository.findOne({ where: { id } });
		if (!konten) {
			throw new NotFoundException(`Konten dengan ID ${id} tidak ditemukan`);
		}
		return konten;
	}

	async update(id: number, dto: UpdateKontenDto): Promise<KontenMateri> {
		const konten = await this.findById(id);

		// If filePath is being replaced/removed, delete old file
		if (dto.filePath && dto.filePath !== konten.filePath && konten.filePath) {
			await this.fileUploadService.deleteFile(konten.filePath);
		}

		Object.assign(konten, dto);
		return this.kontenRepository.save(konten);
	}

	async delete(id: number): Promise<void> {
		const konten = await this.findById(id);

		// Delete file if exists
		if (konten.filePath) {
			await this.fileUploadService.deleteFile(konten.filePath);
		}

		await this.kontenRepository.remove(konten);
	}
}
