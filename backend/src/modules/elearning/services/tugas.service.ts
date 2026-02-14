import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Tugas, TugasStatus } from "../entities/tugas.entity";
import { CreateTugasDto, UpdateTugasDto } from "../dtos/tugas.dto";
import {
	PaginationQueryDto,
	PaginatedResponseDto,
} from "../dtos/pagination.dto";
import { Materi } from "../entities/materi.entity";
import { JawabanTugas } from "../entities/jawaban-tugas.entity";
import { FileUploadService } from "./file-upload.service";

@Injectable()
export class TugasService {
	constructor(
		@InjectRepository(Tugas)
		private readonly tugasRepository: Repository<Tugas>,
		@InjectRepository(Materi)
		private readonly materiRepository: Repository<Materi>,
		@InjectRepository(JawabanTugas)
		private readonly jawabanTugasRepository: Repository<JawabanTugas>,
		private readonly fileUploadService: FileUploadService,
	) {}

	async create(guruId: number, dto: CreateTugasDto): Promise<Tugas> {
		const tugas = this.tugasRepository.create({
			...dto,
			guruId,
			tanggalBuka: new Date(dto.tanggalBuka),
			tanggalDeadline: dto.tanggalDeadline
				? new Date(dto.tanggalDeadline)
				: null,
			status: dto.status || TugasStatus.DRAFT,
		});

		// Validate deadline >= open date
		if (tugas.tanggalDeadline && tugas.tanggalDeadline < tugas.tanggalBuka) {
			throw new BadRequestException(
				"Tanggal deadline harus lebih besar atau sama dengan tanggal dibuka",
			);
		}

		return this.tugasRepository.save(tugas);
	}

	async createForMateri(materiId: number, dto: CreateTugasDto): Promise<Tugas> {
		// Fetch materi to get mataPelajaranId
		const materi = await this.materiRepository.findOne({
			where: { id: materiId },
		});

		if (!materi) {
			throw new NotFoundException(
				`Materi dengan ID ${materiId} tidak ditemukan`,
			);
		}

		const tugas = this.tugasRepository.create({
			...dto,
			materiId,
			mataPelajaranId: materi.mataPelajaranId, // Use materi's mata pelajaran
			tanggalBuka: new Date(dto.tanggalBuka || new Date()),
			tanggalDeadline: dto.tanggalDeadline
				? new Date(dto.tanggalDeadline)
				: null,
			status: dto.status || TugasStatus.DRAFT,
		});

		// Validate deadline >= open date
		if (tugas.tanggalDeadline && tugas.tanggalDeadline < tugas.tanggalBuka) {
			throw new BadRequestException(
				"Tanggal deadline harus lebih besar atau sama dengan tanggal dibuka",
			);
		}

		return this.tugasRepository.save(tugas);
	}

	async findAll(
		materiId: number,
		status?: TugasStatus,
		pagination?: PaginationQueryDto,
	): Promise<Tugas[] | PaginatedResponseDto<Tugas>> {
		const query = this.tugasRepository
			.createQueryBuilder("tugas")
			.where("tugas.materiId = :materiId", { materiId });

		if (status) {
			query.andWhere("tugas.status = :status", { status });
		}

		query.orderBy("tugas.createdAt", "DESC");

		if (pagination) {
			const page = Number(pagination.page) || 1;
			const limit = Number(pagination.limit) || 10;
			const skip = (page - 1) * limit;

			const [data, total] = await query
				.skip(skip)
				.take(limit)
				.getManyAndCount();

			return new PaginatedResponseDto(data, page, limit, total);
		}

		return query.getMany();
	}

	async findById(id: number): Promise<Tugas> {
		const tugas = await this.tugasRepository.findOne({
			where: { id },
			relations: ["materi", "guru", "jawaban"],
		});

		if (!tugas) {
			throw new NotFoundException(`Tugas dengan ID ${id} tidak ditemukan`);
		}

		return tugas;
	}

	async findByGuruId(
		guruId: number,
		status?: TugasStatus,
		pagination?: PaginationQueryDto,
	): Promise<Tugas[] | PaginatedResponseDto<Tugas>> {
		const query = this.tugasRepository
			.createQueryBuilder("tugas")
			.where("tugas.guruId = :guruId", { guruId })
			.leftJoinAndSelect("tugas.materi", "materi")
			.leftJoinAndSelect("tugas.guru", "guru");

		if (status) {
			query.andWhere("tugas.status = :status", { status });
		}

		query.orderBy("tugas.createdAt", "DESC");

		if (pagination) {
			const page = Number(pagination.page) || 1;
			const limit = Number(pagination.limit) || 10;
			const skip = (page - 1) * limit;

			const [data, total] = await query
				.skip(skip)
				.take(limit)
				.getManyAndCount();

			return new PaginatedResponseDto(data, page, limit, total);
		}

		return query.getMany();
	}

	async update(
		id: number,
		guruId: number,
		dto: UpdateTugasDto,
	): Promise<Tugas> {
		const tugas = await this.findById(id);

		// Allow if guruId matches OR tugas has no guruId (admin created)
		if (tugas.guruId !== null && tugas.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk mengubah tugas ini",
			);
		}

		// Set guruId if not already set
		if (!tugas.guruId) {
			tugas.guruId = guruId;
		}

		const updateData: any = { ...dto };
		if (dto.tanggalBuka) {
			updateData.tanggalBuka =
				typeof dto.tanggalBuka === "string"
					? new Date(dto.tanggalBuka)
					: dto.tanggalBuka;
		}
		if (dto.tanggalDeadline) {
			updateData.tanggalDeadline =
				typeof dto.tanggalDeadline === "string"
					? new Date(dto.tanggalDeadline)
					: dto.tanggalDeadline;
		}

		// Validate deadline >= open date
		const finalBuka = updateData.tanggalBuka || tugas.tanggalBuka;
		const finalDeadline = updateData.tanggalDeadline || tugas.tanggalDeadline;

		if (finalDeadline && finalDeadline < finalBuka) {
			throw new BadRequestException(
				"Tanggal deadline harus lebih besar atau sama dengan tanggal dibuka",
			);
		}

		Object.assign(tugas, updateData);
		return this.tugasRepository.save(tugas);
	}

	async updateAdmin(id: number, dto: UpdateTugasDto): Promise<Tugas> {
		const tugas = await this.findById(id);
		// Admin can update any tugas without ownership check

		const updateData: any = { ...dto };
		if (dto.tanggalBuka) {
			updateData.tanggalBuka =
				typeof dto.tanggalBuka === "string"
					? new Date(dto.tanggalBuka)
					: dto.tanggalBuka;
		}
		if (dto.tanggalDeadline) {
			updateData.tanggalDeadline =
				typeof dto.tanggalDeadline === "string"
					? new Date(dto.tanggalDeadline)
					: dto.tanggalDeadline;
		}

		// Validate deadline >= open date
		const finalBuka = updateData.tanggalBuka || tugas.tanggalBuka;
		const finalDeadline = updateData.tanggalDeadline || tugas.tanggalDeadline;

		if (finalDeadline && finalDeadline < finalBuka) {
			throw new BadRequestException(
				"Tanggal deadline harus lebih besar atau sama dengan tanggal dibuka",
			);
		}

		Object.assign(tugas, updateData);
		return this.tugasRepository.save(tugas);
	}

	async publishTugas(id: number, guruId: number): Promise<Tugas> {
		const tugas = await this.findById(id);

		// Allow if guruId matches OR tugas has no guruId (admin created)
		if (tugas.guruId !== null && tugas.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk mempublikasikan tugas ini",
			);
		}

		// Set guruId if not already set
		if (!tugas.guruId) {
			tugas.guruId = guruId;
		}

		tugas.status = TugasStatus.PUBLISHED;
		return this.tugasRepository.save(tugas);
	}

	async publishTugasAdmin(id: number): Promise<Tugas> {
		const tugas = await this.findById(id);
		// Admin can publish any tugas without ownership check
		tugas.status = TugasStatus.PUBLISHED;
		return this.tugasRepository.save(tugas);
	}

	async closeTugas(id: number, guruId: number): Promise<Tugas> {
		const tugas = await this.findById(id);

		// Allow if guruId matches OR tugas has no guruId (admin created)
		if (tugas.guruId !== null && tugas.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk menutup tugas ini",
			);
		}

		// Set guruId if not already set
		if (!tugas.guruId) {
			tugas.guruId = guruId;
		}

		if (tugas.status !== TugasStatus.PUBLISHED) {
			throw new BadRequestException(
				"Hanya tugas yang dipublikasikan yang dapat ditutup",
			);
		}

		tugas.status = TugasStatus.CLOSED;
		return this.tugasRepository.save(tugas);
	}

	async closeTugasAdmin(id: number): Promise<Tugas> {
		const tugas = await this.findById(id);
		// Admin can close any tugas without ownership check

		if (tugas.status !== TugasStatus.PUBLISHED) {
			throw new BadRequestException(
				"Hanya tugas yang dipublikasikan yang dapat ditutup",
			);
		}

		tugas.status = TugasStatus.CLOSED;
		return this.tugasRepository.save(tugas);
	}

	async delete(id: number, guruId: number): Promise<void> {
		const tugas = await this.findById(id);

		if (tugas.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk menghapus tugas ini",
			);
		}

		// Get all jawaban for this tugas
		const jawabanList = await this.jawabanTugasRepository.find({
			where: { tugasId: id },
		});

		// Delete all files from jawaban
		for (const jawaban of jawabanList) {
			if (jawaban.filePath) {
				await this.fileUploadService.deleteFile(jawaban.filePath);
			}
		}

		// Delete all jawaban entries
		if (jawabanList.length > 0) {
			await this.jawabanTugasRepository.remove(jawabanList);
		}

		// Delete tugas itself
		await this.tugasRepository.remove(tugas);
	}

	async deleteAdmin(id: number): Promise<void> {
		const tugas = await this.findById(id);

		// Get all jawaban for this tugas
		const jawabanList = await this.jawabanTugasRepository.find({
			where: { tugasId: id },
		});

		// Delete all files from jawaban
		for (const jawaban of jawabanList) {
			if (jawaban.filePath) {
				await this.fileUploadService.deleteFile(jawaban.filePath);
			}
		}

		// Delete all jawaban entries
		if (jawabanList.length > 0) {
			await this.jawabanTugasRepository.remove(jawabanList);
		}

		// Admin can delete any tugas without ownership check
		await this.tugasRepository.remove(tugas);
	}

	async getTugasForSiswa(tugasId: number): Promise<Tugas> {
		const tugas = await this.findById(tugasId);

		// Check if task is already opened
		const now = new Date();
		if (tugas.tanggalBuka > now) {
			throw new BadRequestException(
				"Tugas belum dibuka. Silakan coba lagi nanti.",
			);
		}

		if (tugas.status !== TugasStatus.PUBLISHED) {
			throw new NotFoundException("Tugas tidak tersedia");
		}

		return tugas;
	}

	async getAvailableTugas(materiId: number): Promise<Tugas[]> {
		const now = new Date();

		return this.tugasRepository
			.createQueryBuilder("tugas")
			.where("tugas.materiId = :materiId", { materiId })
			.andWhere("tugas.status = :status", { status: TugasStatus.PUBLISHED })
			.andWhere("tugas.tanggalBuka <= :now", { now })
			.orderBy("tugas.tanggalBuka", "DESC")
			.getMany();
	}

	async getAvailableTugasByMapel(mapelId: number): Promise<Tugas[]> {
		const now = new Date();

		return this.tugasRepository
			.createQueryBuilder("tugas")
			.innerJoin("tugas.materi", "materi")
			.where("materi.mataPelajaranId = :mapelId", { mapelId })
			.andWhere("tugas.status = :status", { status: TugasStatus.PUBLISHED })
			.andWhere("tugas.tanggalBuka <= :now", { now })
			.leftJoinAndSelect("tugas.materi", "materi_select")
			.orderBy("tugas.tanggalBuka", "DESC")
			.getMany();
	}

	async getAvailableTugasForSiswa(pesertaDidikId: number): Promise<Tugas[]> {
		const now = new Date();

		return this.tugasRepository
			.createQueryBuilder("tugas")
			.innerJoin("tugas.materi", "materi")
			.leftJoinAndSelect("tugas.materi", "materi_select")
			.where("tugas.status = :status", { status: TugasStatus.PUBLISHED })
			.andWhere("tugas.tanggalBuka <= :now", { now })
			.orderBy("tugas.tanggalBuka", "DESC")
			.getMany();
	}

	async checkIfLate(tugasId: number, submittedAt: Date): Promise<boolean> {
		const tugas = await this.findById(tugasId);

		if (!tugas.tanggalDeadline) {
			return false;
		}

		return submittedAt > tugas.tanggalDeadline;
	}

	async updateVisibility(id: number, visible: boolean): Promise<Tugas> {
		const tugas = await this.findById(id);
		tugas.visible = visible;
		return this.tugasRepository.save(tugas);
	}

	async updateFile(
		id: number,
		guruId: number,
		fileData:
			| { filePath: string; fileName: string; fileType: string }
			| Express.Multer.File,
	): Promise<Tugas> {
		const tugas = await this.findById(id);

		console.log(
			`[DEBUG updateFile] Tugas ID: ${id}, Tugas.guruId: ${tugas.guruId}, User guruId: ${guruId}`,
		);

		// Simplified: Guru dapat upload file ke tugas apapun yang bisa mereka akses
		// (Authorization dihandle di controller level dengan @Roles decorator)
		// Hanya set/update guruId jika belum ada
		if (!tugas.guruId) {
			tugas.guruId = guruId;
			console.log(`[DEBUG] Setting guruId to ${guruId}`);
		}

		console.log(`[DEBUG] Proceeding with file update`);

		// Handle both File object (legacy) and upload result object (new)
		if ("filePath" in fileData) {
			tugas.filePath = fileData.filePath;
			tugas.fileName = fileData.fileName;
			tugas.fileType = fileData.fileType;
		} else {
			tugas.filePath = fileData.path;
			tugas.fileName = fileData.originalname;
			tugas.fileType = fileData.mimetype;
		}

		return this.tugasRepository.save(tugas);
	}

	async updateFileAdmin(
		id: number,
		fileData:
			| { filePath: string; fileName: string; fileType: string }
			| Express.Multer.File,
	): Promise<Tugas> {
		const tugas = await this.findById(id);

		// Handle both File object (legacy) and upload result object (new)
		if ("filePath" in fileData) {
			tugas.filePath = fileData.filePath;
			tugas.fileName = fileData.fileName;
			tugas.fileType = fileData.fileType;
		} else {
			tugas.filePath = fileData.path;
			tugas.fileName = fileData.originalname;
			tugas.fileType = fileData.mimetype;
		}

		return this.tugasRepository.save(tugas);
	}
}
