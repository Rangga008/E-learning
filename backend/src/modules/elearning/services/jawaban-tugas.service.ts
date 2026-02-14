import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ConflictException,
	OnModuleInit,
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
export class JawabanTugasService implements OnModuleInit {
	constructor(
		@InjectRepository(JawabanTugas)
		private readonly jawabanRepository: Repository<JawabanTugas>,
		private readonly tugasService: TugasService,
	) {}

	async onModuleInit() {
		// Automatically fix DRAFT submissions with files on startup
		try {
			const count = await this.fixDraftSubmissionsWithFiles();
			if (count > 0) {
				console.log(
					`✅ [STARTUP] Fixed ${count} DRAFT submissions with files to SUBMITTED status`,
				);
			}
		} catch (error) {
			console.error("[STARTUP] Error fixing draft submissions:", error);
		}
	}

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

		// If exists, update it instead of creating new
		if (existing) {
			// Update the existing record
			Object.assign(existing, {
				...dto,
				updatedAt: new Date(),
			});
			return this.jawabanRepository.save(existing);
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

	async updateFile(
		id: number,
		pesertaDidikId: number,
		fileData: {
			filePath: string;
			tipeFile: string;
			fileName: string;
		},
	): Promise<JawabanTugas> {
		const jawaban = await this.findById(id);

		if (jawaban.pesertaDidikId !== pesertaDidikId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk mengubah jawaban ini",
			);
		}

		// Allow file update even after submission
		jawaban.filePath = fileData.filePath;
		jawaban.tipeFile = fileData.tipeFile;
		jawaban.fileName = fileData.fileName;
		jawaban.updatedAt = new Date();

		return this.jawabanRepository.save(jawaban);
	}

	async submit(id: number, pesertaDidikId: number): Promise<JawabanTugas> {
		console.log(
			`\n[SUBMIT] Submitting jawaban ${id} for student ${pesertaDidikId}`,
		);

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

		const oldStatus = jawaban.statusSubmisi;
		jawaban.statusSubmisi = StatusSubmisi.SUBMITTED;
		jawaban.submittedAt = new Date();

		// Check if late
		jawaban.isLate = await this.tugasService.checkIfLate(
			jawaban.tugasId,
			jawaban.submittedAt,
		);

		const result = await this.jawabanRepository.save(jawaban);
		console.log(
			`[SUBMIT] ✅ Jawaban ${id} status changed: ${oldStatus} → ${result.statusSubmisi}`,
		);
		return result;
	}

	async getJawabanForGrading(tugasId: number): Promise<JawabanTugas[]> {
		console.log(
			`\n[QUERY DEBUG] getJawabanForGrading called for tugasId: ${tugasId}`,
		);

		// First, check ALL submissions for this task (debug)
		const allSubmissions = await this.jawabanRepository.find({
			where: { tugasId },
			relations: ["pesertaDidik"],
		});
		console.log(
			`[QUERY DEBUG] Total submissions for tugasId ${tugasId}: ${allSubmissions.length}`,
		);

		allSubmissions.forEach((s) => {
			console.log(
				`  [ALL] ID: ${s.id}, Status: "${
					s.statusSubmisi
				}", HasFile: ${!!s.filePath}, FileName: "${s.fileName}", FilePath: "${
					s.filePath
				}", Student: ${s.pesertaDidik?.namaLengkap}`,
			);
		});

		// Now run the actual query
		const jawaban = await this.jawabanRepository
			.createQueryBuilder("jawaban")
			.where("jawaban.tugasId = :tugasId", { tugasId })
			.andWhere(
				"(jawaban.statusSubmisi = :submitted OR (jawaban.statusSubmisi = :draft AND jawaban.filePath IS NOT NULL AND jawaban.filePath != ''))",
				{
					submitted: StatusSubmisi.SUBMITTED,
					draft: StatusSubmisi.DRAFT,
				},
			)
			.leftJoinAndSelect("jawaban.nilai", "nilai")
			.leftJoinAndSelect("jawaban.pesertaDidik", "pesertaDidik")
			.orderBy("jawaban.submittedAt", "ASC")
			.getMany();

		console.log(
			`[QUERY DEBUG] Filtered submissions for tugasId ${tugasId}: ${jawaban.length}`,
		);
		jawaban.forEach((j) => {
			console.log(
				`  [FILTERED] Student: ${j.pesertaDidik?.namaLengkap}, Status: "${
					j.statusSubmisi
				}", File: "${j.fileName || "N/A"}"`,
			);
		});

		return jawaban;
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

	async getJawabanCountByMateri(
		pesertaDidikId: number,
		materiId: number,
	): Promise<{ taskCount: number; completedCount: number }> {
		// We need to inject TugasRepository to count tasks properly
		// For now, use raw query with camelCase column names
		const taskCountResult = await this.jawabanRepository.query(
			`
				SELECT COUNT(t.id) as count
				FROM tugas t
				WHERE t.materiId = ? AND t.status = 'PUBLISHED'
			`,
			[materiId],
		);

		const taskCount = parseInt(taskCountResult[0]?.count || 0, 10);

		//  Count student's completed task submissions for this material
		const completedCount = await this.jawabanRepository
			.createQueryBuilder("jt")
			.leftJoinAndSelect("jt.tugas", "tugas")
			.where("jt.pesertaDidikId = :pesertaDidikId", { pesertaDidikId })
			.andWhere("tugas.materiId = :materiId", { materiId })
			.getCount();

		console.log(
			`[DEBUG] Material ${materiId}, Student ${pesertaDidikId}: taskCount=${taskCount}, completedCount=${completedCount}`,
		);

		return { taskCount, completedCount };
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

	/**
	 * Get all submissions for a tugas (unfiltered - debug purpose)
	 */
	async findAllByTugasId(tugasId: number): Promise<JawabanTugas[]> {
		return this.jawabanRepository.find({
			where: { tugasId },
			relations: ["pesertaDidik", "nilai"],
			order: { createdAt: "DESC" },
		});
	}

	/**
	 * Fix existing DRAFT submissions that have files - mark them as SUBMITTED
	 * This is for retroactive fix of submissions that were created before auto-submit was implemented
	 */
	async fixDraftSubmissionsWithFiles(): Promise<number> {
		const result = await this.jawabanRepository
			.createQueryBuilder()
			.update(JawabanTugas)
			.set({
				statusSubmisi: StatusSubmisi.SUBMITTED,
				submittedAt: new Date(),
			})
			.where("statusSubmisi = :draft", { draft: StatusSubmisi.DRAFT })
			.andWhere("filePath IS NOT NULL")
			.andWhere("filePath != ''")
			.execute();

		const count = result.affected || 0;
		console.log(
			`[FIX] Updated ${count} DRAFT submissions with files to SUBMITTED status`,
		);
		return count;
	}
}
