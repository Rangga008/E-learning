import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JawabanTugas, StatusSubmisi } from "../entities/jawaban-tugas.entity";
import {
	CreateJawabanTugasDto,
	SubmitJawabanTugasDto,
	UpdateJawabanTugasDto,
} from "../dtos/jawaban-tugas.dto";
import { TugasService } from "./tugas.service";

@Injectable()
export class JawabanTugasService {
	constructor(
		@InjectRepository(JawabanTugas)
		private readonly jawabanRepository: Repository<JawabanTugas>,
		private readonly tugasService: TugasService,
	) {}

	async create(
		pesertaDidikId: number,
		dto: CreateJawabanTugasDto,
	): Promise<JawabanTugas> {
		// Check if answer already exists
		const existing = await this.jawabanRepository.findOne({
			where: {
				tugasId: dto.tugasId,
				pesertaDidikId,
			},
		});

		if (existing) {
			throw new ConflictException(
				"Anda sudah memiliki jawaban untuk tugas ini. Gunakan endpoint update untuk mengubah jawaban.",
			);
		}

		// Validate task is opened
		await this.tugasService.getTugasForSiswa(dto.tugasId);

		const jawaban = this.jawabanRepository.create({
			...dto,
			pesertaDidikId,
			statusSubmisi: StatusSubmisi.DRAFT,
		});

		return this.jawabanRepository.save(jawaban);
	}

	async findById(id: number): Promise<JawabanTugas> {
		const jawaban = await this.jawabanRepository.findOne({
			where: { id },
			relations: ["tugas", "pesertaDidik", "nilai"],
		});

		if (!jawaban) {
			throw new NotFoundException(`Jawaban dengan ID ${id} tidak ditemukan`);
		}

		return jawaban;
	}

	async findByTugasAndSiswa(
		tugasId: number,
		pesertaDidikId: number,
	): Promise<JawabanTugas> {
		const jawaban = await this.jawabanRepository.findOne({
			where: {
				tugasId,
				pesertaDidikId,
			},
			relations: ["tugas", "nilai"],
		});

		if (!jawaban) {
			throw new NotFoundException("Jawaban tidak ditemukan");
		}

		return jawaban;
	}

	async update(
		id: number,
		pesertaDidikId: number,
		dto: UpdateJawabanTugasDto,
	): Promise<JawabanTugas> {
		const jawaban = await this.findById(id);

		if (jawaban.pesertaDidikId !== pesertaDidikId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk mengubah jawaban ini",
			);
		}

		if (jawaban.statusSubmisi === StatusSubmisi.SUBMITTED) {
			throw new BadRequestException(
				"Jawaban yang sudah disubmit tidak dapat diubah",
			);
		}

		// Validate task is still opened
		await this.tugasService.getTugasForSiswa(jawaban.tugasId);

		Object.assign(jawaban, dto);
		return this.jawabanRepository.save(jawaban);
	}

	async submit(id: number, pesertaDidikId: number): Promise<JawabanTugas> {
		const jawaban = await this.findById(id);

		if (jawaban.pesertaDidikId !== pesertaDidikId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk mensubmit jawaban ini",
			);
		}

		if (!jawaban.jawabanTeks && !jawaban.filePath) {
			throw new BadRequestException(
				"Jawaban tidak boleh kosong. Silakan masukkan jawaban atau upload file.",
			);
		}

		// Check if task is still available
		const tugas = await this.tugasService.findById(jawaban.tugasId);
		if (tugas.status !== "PUBLISHED") {
			throw new BadRequestException("Tugas tidak tersedia untuk submission");
		}

		jawaban.statusSubmisi = StatusSubmisi.SUBMITTED;
		jawaban.submittedAt = new Date();

		// Check if late
		jawaban.isLate = await this.tugasService.checkIfLate(
			jawaban.tugasId,
			jawaban.submittedAt,
		);

		return this.jawabanRepository.save(jawaban);
	}

	async getJawabanForGrading(tugasId: number): Promise<JawabanTugas[]> {
		return this.jawabanRepository
			.createQueryBuilder("jawaban")
			.where("jawaban.tugasId = :tugasId", { tugasId })
			.andWhere("jawaban.statusSubmisi = :status", {
				status: StatusSubmisi.SUBMITTED,
			})
			.leftJoinAndSelect("jawaban.nilai", "nilai")
			.leftJoinAndSelect("jawaban.pesertaDidik", "pesertaDidik")
			.orderBy("jawaban.submittedAt", "ASC")
			.getMany();
	}

	async getJawabanByGuruId(guruId: number): Promise<JawabanTugas[]> {
		return this.jawabanRepository
			.createQueryBuilder("jawaban")
			.leftJoinAndSelect("jawaban.tugas", "tugas")
			.leftJoinAndSelect("tugas.guru", "guru")
			.leftJoinAndSelect("jawaban.nilai", "nilai")
			.leftJoinAndSelect("jawaban.pesertaDidik", "pesertaDidik")
			.where("guru.id = :guruId", { guruId })
			.orderBy("jawaban.submittedAt", "DESC")
			.getMany();
	}

	async getSiswaAnswers(
		pesertaDidikId: number,
		tugasId?: number,
	): Promise<JawabanTugas[]> {
		const query = this.jawabanRepository
			.createQueryBuilder("jawaban")
			.where("jawaban.pesertaDidikId = :pesertaDidikId", { pesertaDidikId })
			.leftJoinAndSelect("jawaban.tugas", "tugas")
			.leftJoinAndSelect("jawaban.nilai", "nilai");

		if (tugasId) {
			query.andWhere("jawaban.tugasId = :tugasId", { tugasId });
		}

		return query.orderBy("jawaban.submittedAt", "DESC").getMany();
	}

	async delete(id: number, pesertaDidikId: number): Promise<void> {
		const jawaban = await this.findById(id);

		if (jawaban.pesertaDidikId !== pesertaDidikId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk menghapus jawaban ini",
			);
		}

		if (jawaban.statusSubmisi === StatusSubmisi.SUBMITTED) {
			throw new BadRequestException(
				"Jawaban yang sudah disubmit tidak dapat dihapus",
			);
		}

		await this.jawabanRepository.remove(jawaban);
	}
}
