import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tingkat } from "../entities/tingkat.entity";

@Injectable()
export class TingkatService {
	constructor(
		@InjectRepository(Tingkat)
		private tingkatRepository: Repository<Tingkat>,
	) {}

	async getTingkat() {
		return await this.tingkatRepository.find({
			where: { isActive: true },
			order: { urutan: "ASC" },
		});
	}

	async getTingkatDropdown() {
		const tingkats = await this.tingkatRepository.find({
			where: { isActive: true },
			order: { urutan: "ASC" },
		});
		return { success: true, data: tingkats };
	}

	async getTingkatById(id: number) {
		const tingkat = await this.tingkatRepository.findOne({ where: { id } });
		if (!tingkat) throw new NotFoundException("Tingkat tidak ditemukan");
		return { success: true, data: tingkat };
	}

	async createTingkat(data: any) {
		if (!data.nama) throw new BadRequestException("Nama tingkat harus diisi");

		// Check if nama already exists
		const existing = await this.tingkatRepository.findOne({
			where: { nama: data.nama },
		});
		if (existing) {
			throw new BadRequestException("Tingkat dengan nama ini sudah ada");
		}

		const tingkat = this.tingkatRepository.create({
			nama: data.nama,
			urutan: data.urutan || 1,
			deskripsi: data.deskripsi || "",
			isActive: true,
		});

		const result = await this.tingkatRepository.save(tingkat);
		return {
			success: true,
			message: "Tingkat berhasil ditambahkan",
			data: result,
		};
	}

	async updateTingkat(id: number, data: any) {
		const tingkat = await this.tingkatRepository.findOne({ where: { id } });
		if (!tingkat) throw new NotFoundException("Tingkat tidak ditemukan");

		if (data.nama) {
			// Check if new nama already exists (and not same as current)
			if (data.nama !== tingkat.nama) {
				const existing = await this.tingkatRepository.findOne({
					where: { nama: data.nama },
				});
				if (existing) {
					throw new BadRequestException("Tingkat dengan nama ini sudah ada");
				}
			}
			tingkat.nama = data.nama;
		}

		if (data.urutan) tingkat.urutan = data.urutan;
		if (data.deskripsi !== undefined) tingkat.deskripsi = data.deskripsi;
		if (data.isActive !== undefined) tingkat.isActive = data.isActive;

		const result = await this.tingkatRepository.save(tingkat);
		return {
			success: true,
			message: "Tingkat berhasil diperbarui",
			data: result,
		};
	}

	async deleteTingkat(id: number) {
		const tingkat = await this.tingkatRepository.findOne({ where: { id } });
		if (!tingkat) throw new NotFoundException("Tingkat tidak ditemukan");

		// Check if tingkat is being used by any kelas
		// We'll just soft delete by marking isActive as false
		tingkat.isActive = false;
		await this.tingkatRepository.save(tingkat);

		return { success: true, message: "Tingkat berhasil dihapus" };
	}
}
