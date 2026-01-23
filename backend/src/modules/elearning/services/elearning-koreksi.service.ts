import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SoalEsai } from "../entities/soal-esai.entity";
import { SoalJawabanEsai } from "../entities/soal-jawaban-esai.entity";
import { MateriEsai } from "../entities/materi-esai.entity";

@Injectable()
export class ElearningKoreksiService {
	constructor(
		@InjectRepository(MateriEsai)
		private materiRepo: Repository<MateriEsai>,
		@InjectRepository(SoalEsai)
		private soalEsaiRepo: Repository<SoalEsai>,
		@InjectRepository(SoalJawabanEsai)
		private jawabanEsaiRepo: Repository<SoalJawabanEsai>,
	) {}

	// ========== MATERI & SOAL MANAGEMENT ==========

	/**
	 * Guru membuat materi baru
	 */
	async createMateri(
		mataPelajaranId: number,
		guruId: number,
		data: any,
	): Promise<MateriEsai> {
		const materi = this.materiRepo.create({
			mataPelajaranId,
			guruId,
			...data,
		});
		return (await this.materiRepo.save(materi)) as unknown as MateriEsai;
	}

	/**
	 * Guru input soal esai untuk materi
	 */
	async createSoalEsai(
		materiId: number,
		pertanyaan: string,
		bobot?: number,
	): Promise<SoalEsai> {
		const soal = this.soalEsaiRepo.create({
			materiId,
			pertanyaan,
			bobot: bobot || 1,
		});
		return this.soalEsaiRepo.save(soal);
	}

	/**
	 * Get soal esai berdasarkan materi
	 */
	async getSoalByMateri(materiId: number): Promise<SoalEsai[]> {
		return this.soalEsaiRepo.find({
			where: { materiId },
			order: { createdAt: "ASC" },
		});
	}

	/**
	 * Siswa submit jawaban esai
	 */
	async submitJawabanEsai(
		soalEsaiId: number,
		pesertaDidikId: number,
		jawaban: string,
	): Promise<SoalJawabanEsai> {
		const soal = await this.soalEsaiRepo.findOne({ where: { id: soalEsaiId } });
		if (!soal) throw new NotFoundException("Soal tidak ditemukan");

		// Cek apakah sudah submit sebelumnya
		let jawabanExist = await this.jawabanEsaiRepo.findOne({
			where: { soalEsaiId, pesertaDidikId },
		});

		if (jawabanExist) {
			jawabanExist.jawaban = jawaban;
			jawabanExist.sudahDiperiksa = false;
			jawabanExist.nilai = null;
			return this.jawabanEsaiRepo.save(jawabanExist);
		}

		const jawabanBaru = this.jawabanEsaiRepo.create({
			soalEsaiId,
			pesertaDidikId,
			jawaban,
		});

		return this.jawabanEsaiRepo.save(jawabanBaru);
	}

	/**
	 * Guru mendapatkan list jawaban yang perlu diperiksa
	 */
	async getJawabanPerluDiperiksa(): Promise<SoalJawabanEsai[]> {
		return this.jawabanEsaiRepo.find({
			where: { sudahDiperiksa: false },
			order: { createdAt: "ASC" },
		});
	}

	/**
	 * Guru memberikan nilai & feedback untuk jawaban esai
	 */
	async nilaiJawabanEsai(
		jawabanId: number,
		nilai: number,
		feedback?: string,
	): Promise<SoalJawabanEsai> {
		if (nilai < 0 || nilai > 100) {
			throw new BadRequestException("Nilai harus antara 0-100");
		}

		const jawaban = await this.jawabanEsaiRepo.findOne({
			where: { id: jawabanId },
		});
		if (!jawaban) throw new NotFoundException("Jawaban tidak ditemukan");

		jawaban.nilai = nilai;
		jawaban.feedback = feedback;
		jawaban.sudahDiperiksa = true;
		jawaban.tanggalDiperiksa = new Date();

		return this.jawabanEsaiRepo.save(jawaban);
	}

	/**
	 * Get rekap nilai siswa (untuk laporan)
	 */
	async getRekaptNilaiSiswa(pesertaDidikId: number): Promise<{
		totalSoal: number;
		sudahDiperiksa: number;
		rataRataNilai: number;
	}> {
		const jawaban = await this.jawabanEsaiRepo.find({
			where: { pesertaDidikId },
		});

		const sudahDiperiksa = jawaban.filter((j) => j.sudahDiperiksa).length;
		const nilaiArr = jawaban
			.filter((j) => j.nilai !== null && j.nilai !== undefined)
			.map((j) => j.nilai!);
		const rataRata =
			nilaiArr.length > 0
				? nilaiArr.reduce((a, b) => a + b) / nilaiArr.length
				: 0;

		return {
			totalSoal: jawaban.length,
			sudahDiperiksa,
			rataRataNilai: Math.round(rataRata * 100) / 100,
		};
	}
}
