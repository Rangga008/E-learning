import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SoalNumerasi } from "../entities/soal-numerasi.entity";
import { JawabanNumerasi } from "../entities/jawaban-numerasi.entity";

@Injectable()
export class NumerasiService {
	constructor(
		@InjectRepository(SoalNumerasi)
		private soalNumerasiRepository: Repository<SoalNumerasi>,
		@InjectRepository(JawabanNumerasi)
		private jawabanNumerasiRepository: Repository<JawabanNumerasi>,
	) {}

	// Bank Soal
	async createSoal(data: any) {
		if (!data.soal || !data.level) {
			throw new BadRequestException("soal dan level harus diisi");
		}

		const soal = this.soalNumerasiRepository.create(data);
		const result = await this.soalNumerasiRepository.save(soal);

		return {
			success: true,
			message: "Soal berhasil dibuat",
			data: result,
		};
	}

	async getSoalByKategori(kategori: string) {
		const soal = await this.soalNumerasiRepository.find({
			where: { kategori },
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: soal,
		};
	}

	async getSoalByLevel(level: number) {
		const soal = await this.soalNumerasiRepository.find({
			where: { level },
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: soal,
		};
	}

	async getSoalHarian(pesertaDidikId: number, hari: string) {
		const topik = this.getTopicByDay(hari);
		const soal = await this.soalNumerasiRepository.find({
			where: { kategori: topik },
			take: 10,
			order: { createdAt: "DESC" },
		});

		if (!soal.length) {
			throw new NotFoundException(`Soal untuk topik ${topik} tidak ditemukan`);
		}

		return {
			success: true,
			data: soal,
			topik,
			hari,
		};
	}

	// Jawaban
	async submitJawaban(data: any) {
		if (!data.pesertaDidikId || !data.soalId) {
			throw new BadRequestException("pesertaDidikId dan soalId harus diisi");
		}

		const jawaban = this.jawabanNumerasiRepository.create({
			...data,
			tanggal: new Date(),
		});

		const result = await this.jawabanNumerasiRepository.save(jawaban);

		return {
			success: true,
			message: "Jawaban berhasil dikirim",
			data: result,
		};
	}

	async getJawabanByPesertaDidik(pesertaDidikId: number) {
		const jawaban = await this.jawabanNumerasiRepository.find({
			where: { pesertaDidikId },
			order: { tanggal: "DESC" },
		});

		return {
			success: true,
			data: jawaban,
			total: jawaban.length,
		};
	}

	async getJawabanHistory(pesertaDidikId: number, days: number = 7) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const jawaban = await this.jawabanNumerasiRepository
			.createQueryBuilder("jawaban")
			.where("jawaban.pesertaDidikId = :pesertaDidikId", { pesertaDidikId })
			.andWhere("jawaban.tanggal >= :startDate", { startDate })
			.orderBy("jawaban.tanggal", "DESC")
			.getMany();

		return {
			success: true,
			data: jawaban,
			total: jawaban.length,
			period: `${days} hari terakhir`,
		};
	}

	async getJawabanByTanggal(pesertaDidikId: number, tanggal: Date) {
		return await this.jawabanNumerasiRepository.findOne({
			where: { pesertaDidikId, tanggal },
		});
	}

	async getProgressByStudent(pesertaDidikId: number) {
		const jawaban = await this.jawabanNumerasiRepository.find({
			where: { pesertaDidikId },
			order: { tanggal: "DESC" },
			take: 30,
		});

		const totalSoal = jawaban.length;
		const totalBenar = jawaban.reduce(
			(acc, j) => acc + (j.jumlahBenar || 0),
			0,
		);
		const totalSalah = jawaban.reduce(
			(acc, j) => acc + (j.jumlahSalah || 0),
			0,
		);
		const rataRataNilai =
			jawaban.length > 0 ? (totalBenar / (totalBenar + totalSalah)) * 100 : 0;

		return {
			success: true,
			data: {
				totalSoal,
				totalBenar,
				totalSalah,
				rataRataNilai: Math.round(rataRataNilai),
				history: jawaban,
			},
		};
	}

	// Level Configuration
	getLevelConfiguration(level: number) {
		const config = {
			1: { jumlahSoal: 100, kkm: 90, waktu: 30 },
			2: { jumlahSoal: 87, kkm: 86, waktu: 40 },
			3: { jumlahSoal: 73, kkm: 82, waktu: 50 },
			4: { jumlahSoal: 60, kkm: 78, waktu: 60 },
			5: { jumlahSoal: 47, kkm: 74, waktu: 70 },
			6: { jumlahSoal: 33, kkm: 70, waktu: 80 },
			7: { jumlahSoal: 20, kkm: 66, waktu: 90 },
		};

		return {
			success: true,
			data: config[level] || config[1],
			level,
		};
	}

	// Utility: Check if can access menu
	canAccessMenu(hari: string): boolean {
		const hariKerja = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
		return hariKerja.includes(hari);
	}

	// Utility: Get topic by day
	getTopicByDay(hari: string): string {
		const topik = {
			Senin: "penjumlahan",
			Selasa: "pengurangan",
			Rabu: "perkalian",
			Kamis: "pembagian",
			Jumat: "campuran",
		};
		return topik[hari] || "campuran";
	}
}
