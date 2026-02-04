import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NilaiTugas } from "../entities/nilai-tugas.entity";
import {
	CreateNilaiTugasDto,
	UpdateNilaiTugasDto,
} from "../dtos/nilai-tugas.dto";
import { JawabanTugas } from "../entities/jawaban-tugas.entity";
import { NotifikasiService } from "./notifikasi.service";
import { TipeNotifikasi } from "../entities/notifikasi.entity";

@Injectable()
export class NilaiTugasService {
	constructor(
		@InjectRepository(NilaiTugas)
		private readonly nilaiRepository: Repository<NilaiTugas>,
		@InjectRepository(JawabanTugas)
		private readonly jawabanRepository: Repository<JawabanTugas>,
		private readonly notifikasiService: NotifikasiService,
	) {}

	async create(guruId: number, dto: CreateNilaiTugasDto): Promise<NilaiTugas> {
		// Check if jawaban exists
		const jawaban = await this.jawabanRepository.findOne({
			where: { id: dto.jawabanTugasId },
			relations: ["tugas"],
		});

		if (!jawaban) {
			throw new NotFoundException("Jawaban tidak ditemukan");
		}

		// Check if nilai already exists
		const existing = await this.nilaiRepository.findOne({
			where: { jawabanTugasId: dto.jawabanTugasId },
		});

		if (existing) {
			throw new BadRequestException(
				"Nilai untuk jawaban ini sudah ada dan tidak dapat diubah (fitur revoke tidak tersedia)",
			);
		}

		// Validate nilai
		if (dto.nilai < 0 || dto.nilai > jawaban.tugas.nilaiMaksimal) {
			throw new BadRequestException(
				`Nilai harus antara 0 dan ${jawaban.tugas.nilaiMaksimal}`,
			);
		}

		const nilai = this.nilaiRepository.create({
			...dto,
			guruId,
			gradedAt: new Date(),
		});

		const savedNilai = await this.nilaiRepository.save(nilai);

		// Create notification for siswa
		await this.notifikasiService.createNotification(
			jawaban.pesertaDidikId,
			TipeNotifikasi.NILAI_MASUK,
			"Nilai Tugas Masuk",
			`Tugas Anda telah dinilai. Nilai: ${dto.nilai}/${jawaban.tugas.nilaiMaksimal}`,
			jawaban.tugas.id,
		);

		return savedNilai;
	}

	async findById(id: number): Promise<NilaiTugas> {
		const nilai = await this.nilaiRepository.findOne({
			where: { id },
			relations: ["jawaban", "guru"],
		});

		if (!nilai) {
			throw new NotFoundException(`Nilai dengan ID ${id} tidak ditemukan`);
		}

		return nilai;
	}

	async findByJawabanId(jawabanTugasId: number): Promise<NilaiTugas> {
		const nilai = await this.nilaiRepository.findOne({
			where: { jawabanTugasId },
		});

		if (!nilai) {
			throw new NotFoundException("Nilai tidak ditemukan untuk jawaban ini");
		}

		return nilai;
	}

	async delete(id: number, guruId: number): Promise<void> {
		const nilai = await this.findById(id);

		if (nilai.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk menghapus nilai ini",
			);
		}

		// Note: In the system design, revoke is NOT allowed
		// But we keep this method for potential admin purposes
		throw new BadRequestException(
			"Fitur menghapus/revoke nilai tidak tersedia",
		);
	}

	async getNilaiByTugas(tugasId: number): Promise<NilaiTugas[]> {
		return this.nilaiRepository
			.createQueryBuilder("nilai")
			.leftJoin("nilai.jawaban", "jawaban")
			.leftJoin("jawaban.tugas", "tugas")
			.where("tugas.id = :tugasId", { tugasId })
			.orderBy("nilai.createdAt", "DESC")
			.getMany();
	}

	async getNilaiByGuru(guruId: number): Promise<NilaiTugas[]> {
		return this.nilaiRepository.find({
			where: { guruId },
			relations: ["jawaban", "jawaban.tugas"],
			order: { createdAt: "DESC" },
		});
	}

	async getNilaiBySiswa(siswaId: number): Promise<NilaiTugas[]> {
		return this.nilaiRepository
			.createQueryBuilder("nilai")
			.leftJoin("nilai.jawaban", "jawaban")
			.leftJoin("jawaban.pesertaDidik", "pesertaDidik")
			.leftJoin("jawaban.tugas", "tugas")
			.leftJoin("tugas.materi", "materi")
			.where("pesertaDidik.id = :siswaId", { siswaId })
			.select([
				"nilai",
				"jawaban.id",
				"tugas.id",
				"tugas.judulTugas",
				"tugas.tipe",
				"materi.judulMateri",
			])
			.orderBy("nilai.createdAt", "DESC")
			.getMany();
	}

	async getSiswaStats(siswaId: number): Promise<any> {
		const nilai = await this.nilaiRepository
			.createQueryBuilder("nilai")
			.leftJoin("nilai.jawaban", "jawaban")
			.leftJoin("jawaban.pesertaDidik", "pesertaDidik")
			.leftJoin("jawaban.tugas", "tugas")
			.leftJoin("tugas.materi", "materi")
			.where("pesertaDidik.id = :siswaId", { siswaId })
			.select(["nilai.nilai", "materi.id"])
			.getMany();

		// Get unique materi with completed status
		const materiMap = new Map();
		const nilaiValues: number[] = [];

		nilai.forEach((n) => {
			if (!materiMap.has(n.jawaban?.tugas?.materi?.id)) {
				materiMap.set(n.jawaban?.tugas?.materi?.id, true);
			}
			nilaiValues.push(n.nilai);
		});

		const total = materiMap.size;
		const selesai = nilaiValues.length;
		const sedangBerlangsung = Math.max(0, total - selesai);

		return {
			data: {
				total,
				selesai,
				sedangBerlangsung,
			},
		};
	}
}
