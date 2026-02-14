import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Materi, MateriStatus } from "../entities/materi.entity";
import { CreateMateriDto, UpdateMateriDto } from "../dtos/materi.dto";
import {
	PaginationQueryDto,
	PaginatedResponseDto,
} from "../dtos/pagination.dto";
import { KontenMateri } from "../entities/konten.entity";
import { FileUploadService } from "./file-upload.service";
import { CacheService, CACHE_KEYS } from "@/common/services/cache.service";

@Injectable()
export class MateriService {
	constructor(
		@InjectRepository(Materi)
		private readonly materiRepository: Repository<Materi>,
		@InjectRepository(KontenMateri)
		private readonly kontenRepository: Repository<KontenMateri>,
		private readonly fileUploadService: FileUploadService,
		private readonly cacheService: CacheService,
	) {}

	async create(guruId: number | null, dto: CreateMateriDto): Promise<Materi> {
		const materi = this.materiRepository.create({
			...dto,
			guruId: dto.guruId || guruId,
			status: dto.status || MateriStatus.DRAFT,
		});
		const result = await this.materiRepository.save(materi);

		// Invalidate related caches
		this.cacheService.invalidatePattern("materi:");
		this.cacheService.invalidatePattern(CACHE_KEYS.ALL_MAPEL);

		return result;
	}

	async findAll(
		mapelId: number,
		status?: MateriStatus,
		pagination?: PaginationQueryDto,
	): Promise<Materi[] | PaginatedResponseDto<Materi>> {
		const query = this.materiRepository
			.createQueryBuilder("materi")
			.where("materi.mataPelajaranId = :mapelId", { mapelId });

		if (status) {
			query.andWhere("materi.status = :status", { status });
		}

		query
			.orderBy("materi.urutan", "ASC")
			.addOrderBy("materi.createdAt", "DESC");

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

	async findById(id: number): Promise<Materi> {
		const materi = await this.materiRepository.findOne({
			where: { id },
			relations: ["guru", "mataPelajaran"],
		});

		if (!materi) {
			throw new NotFoundException(`Materi dengan ID ${id} tidak ditemukan`);
		}

		return materi;
	}

	// Get all materi for admin (without mapelId filter)
	async findAllForAdmin(
		pagination?: PaginationQueryDto,
	): Promise<Materi[] | PaginatedResponseDto<Materi>> {
		const query = this.materiRepository
			.createQueryBuilder("materi")
			.leftJoinAndSelect("materi.guru", "guru")
			.leftJoinAndSelect("materi.mataPelajaran", "mataPelajaran")
			.leftJoinAndSelect("materi.tugas", "tugas")
			.orderBy("materi.createdAt", "DESC");

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

	// Get all materi by guru
	async findByGuruId(
		guruId: number,
		status?: MateriStatus,
		pagination?: PaginationQueryDto,
	): Promise<Materi[] | PaginatedResponseDto<Materi>> {
		const query = this.materiRepository
			.createQueryBuilder("materi")
			.where("materi.guruId = :guruId", { guruId })
			.leftJoinAndSelect("materi.mataPelajaran", "mataPelajaran")
			.leftJoinAndSelect("materi.guru", "guru");

		if (status) {
			query.andWhere("materi.status = :status", { status });
		}

		query
			.orderBy("materi.urutan", "ASC")
			.addOrderBy("materi.createdAt", "DESC");

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
		dto: UpdateMateriDto,
	): Promise<Materi> {
		const materi = await this.findById(id);

		// Allow if guruId matches OR materi has no guruId (admin created)
		if (materi.guruId !== null && materi.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk mengubah materi ini",
			);
		}

		// Set guruId if not already set
		if (!materi.guruId) {
			materi.guruId = guruId;
		}

		Object.assign(materi, dto);
		return this.materiRepository.save(materi);
	}

	async updateAdmin(id: number, dto: UpdateMateriDto): Promise<Materi> {
		const materi = await this.findById(id);
		// Admin can update any materi without ownership check
		Object.assign(materi, dto);
		return this.materiRepository.save(materi);
	}

	async publishMateri(id: number, guruId: number): Promise<Materi> {
		const materi = await this.findById(id);

		// Allow if guruId matches OR materi has no guruId (admin created)
		if (materi.guruId !== null && materi.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk mempublikasikan materi ini",
			);
		}

		// Set guruId if not already set
		if (!materi.guruId) {
			materi.guruId = guruId;
		}

		materi.status = MateriStatus.PUBLISHED;
		const result = await this.materiRepository.save(materi);

		// Invalidate cache when publishing (affects student views)
		this.cacheService.invalidatePattern("materi:");
		this.cacheService.invalidatePattern(CACHE_KEYS.ALL_MAPEL);

		return result;
	}

	async closeMateri(id: number, guruId: number): Promise<Materi> {
		const materi = await this.findById(id);

		// Allow if guruId matches OR materi has no guruId (admin created)
		if (materi.guruId !== null && materi.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk menutup materi ini",
			);
		}

		// Set guruId if not already set
		if (!materi.guruId) {
			materi.guruId = guruId;
		}

		if (materi.status !== MateriStatus.PUBLISHED) {
			throw new BadRequestException(
				"Hanya materi yang dipublikasikan yang dapat ditutup",
			);
		}

		materi.status = MateriStatus.CLOSED;
		return this.materiRepository.save(materi);
	}

	async delete(id: number, guruId: number): Promise<void> {
		const materi = await this.findById(id);

		// Allow if guruId matches OR materi has no guruId (admin created)
		if (materi.guruId !== null && materi.guruId !== guruId) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk menghapus materi ini",
			);
		}

		// Get all konten for this materi
		const kontenList = await this.kontenRepository.find({
			where: { materiId: id },
		});

		// Delete all konten files
		for (const konten of kontenList) {
			if (konten.filePath) {
				await this.fileUploadService.deleteFile(konten.filePath);
			}
		}

		// Delete all konten entries
		if (kontenList.length > 0) {
			await this.kontenRepository.remove(kontenList);
		}

		// Delete materi itself
		await this.materiRepository.remove(materi);
	}

	async deleteAdmin(id: number): Promise<void> {
		const materi = await this.findById(id);

		// Get all konten for this materi
		const kontenList = await this.kontenRepository.find({
			where: { materiId: id },
		});

		// Delete all konten files
		for (const konten of kontenList) {
			if (konten.filePath) {
				await this.fileUploadService.deleteFile(konten.filePath);
			}
		}

		// Delete all konten entries
		if (kontenList.length > 0) {
			await this.kontenRepository.remove(kontenList);
		}

		// Admin can delete any materi without ownership check
		await this.materiRepository.remove(materi);
	}

	async getMateriForSiswa(mapelId: number): Promise<Materi[]> {
		// Check cache first
		const cacheKey = `${CACHE_KEYS.ALL_MAPEL}:siswa:${mapelId}`;
		const cached = this.cacheService.get(cacheKey);
		if (cached) {
			return cached;
		}

		const result = await this.materiRepository
			.createQueryBuilder("materi")
			.where("materi.mataPelajaranId = :mapelId", { mapelId })
			.andWhere("materi.status = :status", { status: MateriStatus.PUBLISHED })
			.orderBy("materi.urutan", "ASC")
			.getMany();

		// Cache for 30 minutes (1800 seconds)
		this.cacheService.set(cacheKey, result, 1800);

		return result;
	}

	async getMapelForSiswa(kelasId: number) {
		// Check cache first
		const cacheKey = `${CACHE_KEYS.ALL_MAPEL}:kelas:${kelasId}`;
		const cached = this.cacheService.get(cacheKey);
		if (cached) {
			return cached;
		}

		// Get all mapel for this kelas and count materi & tugas
		const result = await this.materiRepository.query(
			`
				SELECT DISTINCT
					mp.id,
					mp.nama,
					g.nama as guru_nama,
					COUNT(DISTINCT m.id) as materi_count,
					COUNT(DISTINCT t.id) as tugas_count,
					(SELECT COUNT(DISTINCT jt.id)
					 FROM jawaban_tugas jt
					 WHERE jt.peserta_didik_id = $1
					 AND jt.status_submisi = 'SUBMITTED'
					 AND jt.nilai_id IS NULL) as tugas_belum_dikerjakan
				FROM mata_pelajaran mp
				LEFT JOIN guru_mapel gm ON mp.id = gm.mata_pelajaran_id
				LEFT JOIN guru g ON gm.guru_id = g.id
				LEFT JOIN materi m ON mp.id = m.mata_pelajaran_id AND m.status = 'PUBLISHED'
				LEFT JOIN tugas t ON m.id = t.materi_id AND t.status = 'PUBLISHED'
				WHERE mp.id IN (
					SELECT DISTINCT mata_pelajaran_id FROM guru_mapel
				)
				GROUP BY mp.id, mp.nama, g.id, g.nama
				ORDER BY mp.nama ASC
			`,
			[0],
		); // Note: kelasId parameter would be needed for full implementation

		// Cache for 1 hour (3600 seconds)
		this.cacheService.set(cacheKey, result, 3600);

		return result;
	}

	async getPublishedMateriForSiswa(pesertaDidikId: number): Promise<Materi[]> {
		return this.materiRepository
			.createQueryBuilder("materi")
			.where("materi.status = :status", { status: MateriStatus.PUBLISHED })
			.orderBy("materi.urutan", "ASC")
			.getMany();
	}

	async updateVisibility(id: number, visible: boolean): Promise<Materi> {
		const materi = await this.findById(id);
		materi.visible = visible;
		return this.materiRepository.save(materi);
	}
}
