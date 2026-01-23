import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Angkatan } from "../entities/angkatan.entity";

@Injectable()
export class AngkatanService {
	constructor(
		@InjectRepository(Angkatan)
		private angkatanRepository: Repository<Angkatan>,
	) {}

	async getAngkatan() {
		return await this.angkatanRepository.find({
			where: { aktifkan: true },
			order: { sekolah: "ASC", levelAngkatan: "ASC" },
		});
	}

	async getAngkatanDropdown() {
		const angkatans = await this.angkatanRepository.find({
			where: { aktifkan: true },
			order: { sekolah: "ASC", levelAngkatan: "ASC" },
		});
		return { success: true, data: angkatans };
	}

	async getAngkatanById(id: number) {
		const angkatan = await this.angkatanRepository.findOne({ where: { id } });
		if (!angkatan) throw new NotFoundException("Angkatan tidak ditemukan");
		return { success: true, data: angkatan };
	}

	async createAngkatan(data: any) {
		if (!data.levelAngkatan)
			throw new BadRequestException("Level angkatan harus diisi");
		if (!data.sekolah) throw new BadRequestException("Sekolah harus diisi");
		if (!data.namaAngkatan)
			throw new BadRequestException("Nama angkatan harus diisi");

		// Validate level range based on sekolah
		const levelRange = this.getLevelRange(data.sekolah);
		if (
			data.levelAngkatan < levelRange.min ||
			data.levelAngkatan > levelRange.max
		) {
			throw new BadRequestException(
				`Level ${data.levelAngkatan} tidak valid untuk sekolah ${data.sekolah}`,
			);
		}

		// Check if combination already exists
		const existing = await this.angkatanRepository.findOne({
			where: {
				sekolah: data.sekolah,
				levelAngkatan: data.levelAngkatan,
			},
		});
		if (existing) {
			throw new BadRequestException(
				"Angkatan dengan level dan sekolah ini sudah ada",
			);
		}

		const angkatan = this.angkatanRepository.create({
			levelAngkatan: data.levelAngkatan,
			sekolah: data.sekolah,
			namaAngkatan: data.namaAngkatan,
			aktifkan: data.aktifkan !== false,
		});

		const result = await this.angkatanRepository.save(angkatan);
		return {
			success: true,
			message: "Angkatan berhasil ditambahkan",
			data: result,
		};
	}

	async updateAngkatan(id: number, data: any) {
		const angkatan = await this.angkatanRepository.findOne({ where: { id } });
		if (!angkatan) throw new NotFoundException("Angkatan tidak ditemukan");

		// Validate new level if changed
		if (data.levelAngkatan || data.sekolah) {
			const newSekolah = data.sekolah || angkatan.sekolah;
			const newLevel = data.levelAngkatan || angkatan.levelAngkatan;

			const levelRange = this.getLevelRange(newSekolah);
			if (newLevel < levelRange.min || newLevel > levelRange.max) {
				throw new BadRequestException(
					`Level ${newLevel} tidak valid untuk sekolah ${newSekolah}`,
				);
			}

			// Check if new combination already exists
			if (
				data.levelAngkatan !== angkatan.levelAngkatan ||
				data.sekolah !== angkatan.sekolah
			) {
				const existing = await this.angkatanRepository.findOne({
					where: {
						sekolah: newSekolah,
						levelAngkatan: newLevel,
					},
				});
				if (existing) {
					throw new BadRequestException(
						"Angkatan dengan level dan sekolah ini sudah ada",
					);
				}
			}
		}

		if (data.levelAngkatan) angkatan.levelAngkatan = data.levelAngkatan;
		if (data.sekolah) angkatan.sekolah = data.sekolah;
		if (data.namaAngkatan) angkatan.namaAngkatan = data.namaAngkatan;
		if (data.aktifkan !== undefined) angkatan.aktifkan = data.aktifkan;

		const result = await this.angkatanRepository.save(angkatan);
		return {
			success: true,
			message: "Angkatan berhasil diperbarui",
			data: result,
		};
	}

	async deleteAngkatan(id: number) {
		const angkatan = await this.angkatanRepository.findOne({ where: { id } });
		if (!angkatan) throw new NotFoundException("Angkatan tidak ditemukan");

		// Soft delete by marking aktifkan as false
		angkatan.aktifkan = false;
		await this.angkatanRepository.save(angkatan);

		return {
			success: true,
			message: "Angkatan berhasil dihapus",
		};
	}

	// Helper method to get valid level range based on sekolah
	private getLevelRange(sekolah: string): { min: number; max: number } {
		switch (sekolah) {
			case "SD":
				return { min: 1, max: 6 };
			case "SMP":
				return { min: 7, max: 9 };
			case "SMA":
				return { min: 10, max: 12 };
			case "K":
				return { min: 1, max: 4 };
			default:
				return { min: 1, max: 6 };
		}
	}
}
