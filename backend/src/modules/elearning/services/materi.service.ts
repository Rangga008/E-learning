import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Materi, MateriStatus } from "../entities/materi.entity";
import { CreateMateriDto, UpdateMateriDto } from "../dtos/materi.dto";
import { KontenMateri } from "../entities/konten.entity";
import { FileUploadService } from "./file-upload.service";

@Injectable()
export class MateriService {
	constructor(
		@InjectRepository(Materi)
		private readonly materiRepository: Repository<Materi>,
		@InjectRepository(KontenMateri)
		private readonly kontenRepository: Repository<KontenMateri>,
		private readonly fileUploadService: FileUploadService,
	) {}

	async create(guruId: number | null, dto: CreateMateriDto): Promise<Materi> {
		const materi = this.materiRepository.create({
			...dto,
			guruId: dto.guruId || guruId,
			status: dto.status || MateriStatus.DRAFT,
		});
		return this.materiRepository.save(materi);
	}

	async findAll(mapelId: number, status?: MateriStatus): Promise<Materi[]> {
		const query = this.materiRepository
			.createQueryBuilder("materi")
			.where("materi.mataPelajaranId = :mapelId", { mapelId });

		if (status) {
			query.andWhere("materi.status = :status", { status });
		}

		return query
			.orderBy("materi.urutan", "ASC")
			.addOrderBy("materi.createdAt", "DESC")
			.getMany();
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
	async findAllForAdmin(): Promise<Materi[]> {
		return this.materiRepository.find({
			relations: ["guru", "mataPelajaran", "tugas"],
			order: { createdAt: "DESC" },
		});
	}

	// Get all materi by guru
	async findByGuruId(guruId: number, status?: MateriStatus): Promise<Materi[]> {
		const query = this.materiRepository
			.createQueryBuilder("materi")
			.where("materi.guruId = :guruId", { guruId })
			.leftJoinAndSelect("materi.mataPelajaran", "mataPelajaran")
			.leftJoinAndSelect("materi.guru", "guru");

		if (status) {
			query.andWhere("materi.status = :status", { status });
		}

		return query
			.orderBy("materi.urutan", "ASC")
			.addOrderBy("materi.createdAt", "DESC")
			.getMany();
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
		return this.materiRepository.save(materi);
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
		return this.materiRepository
			.createQueryBuilder("materi")
			.where("materi.mataPelajaranId = :mapelId", { mapelId })
			.andWhere("materi.status = :status", { status: MateriStatus.PUBLISHED })
			.orderBy("materi.urutan", "ASC")
			.getMany();
	}

	async getMapelForSiswa(kelasId: number) {
		// Get all mapel for this kelas and count materi & tugas
		return this.materiRepository.query(
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
