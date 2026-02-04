import {
	Injectable,
	BadRequestException,
	NotFoundException,
	Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Guru } from "../entities/guru.entity";
import { CreateGuruDto } from "../dtos/create-guru.dto";
import { UpdateGuruDto } from "../dtos/update-guru.dto";
import { User, UserRole } from "../../auth/entities/user.entity";
import * as bcrypt from "bcryptjs";
const XLSX = require("xlsx");

@Injectable()
export class GuruService {
	private logger = new Logger(GuruService.name);

	constructor(
		@InjectRepository(Guru)
		private guruRepository: Repository<Guru>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async create(createGuruDto: CreateGuruDto) {
		try {
			// Check duplicate NIP
			const existing = await this.guruRepository.findOne({
				where: { nip: createGuruDto.nip },
			});

			if (existing) {
				throw new BadRequestException("NIP sudah terdaftar");
			}

			// Generate username and password for auto-created user
			const username = createGuruDto.nip; // Use NIP as username
			const password = createGuruDto.nip; // NIP as default password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Check if user already exists
			const existingUser = await this.userRepository.findOne({
				where: { username },
			});

			let savedUser;
			if (existingUser) {
				savedUser = existingUser;
			} else {
				// Create user account automatically
				const user = this.userRepository.create({
					username,
					password: hashedPassword,
					fullName: createGuruDto.namaLengkap,
					role: UserRole.GURU,
					isActive: true,
				});
				savedUser = await this.userRepository.save(user);
			}

			// Create guru with userId
			const guru = this.guruRepository.create({
				...createGuruDto,
				userId: savedUser.id, // Explicitly set userId after spread
			});

			const savedGuru = await this.guruRepository.save(guru);

			// Update user with guruId reference
			savedUser.guruId = savedGuru.id;
			await this.userRepository.save(savedUser);

			console.log(
				"✅ Guru created with id:",
				savedGuru.id,
				"for user id:",
				savedUser.id,
			);
			return savedGuru;
		} catch (error) {
			console.error("❌ Error creating guru:", error.message);
			throw error;
		}
	}

	async findAll(page: number = 1, limit: number = 10) {
		const [data, total] = await this.guruRepository.findAndCount({
			relations: ["kelasWaliList", "kelasMapelList", "mataPelajaran"],
			skip: (page - 1) * limit,
			take: limit,
			order: { id: "DESC" },
		});
		return {
			success: true,
			data,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findOne(id: number) {
		const guru = await this.guruRepository.findOne({
			where: { id },
			relations: ["kelasWaliList", "kelasMapelList", "mataPelajaran"],
		});

		if (!guru) {
			throw new NotFoundException("Guru tidak ditemukan");
		}

		return guru;
	}

	async getMataPelajaranByUserId(userId: number) {
		const guru = await this.guruRepository.findOne({
			where: { userId },
			relations: ["mataPelajaran"],
		});

		if (!guru) {
			throw new NotFoundException("Guru tidak ditemukan");
		}

		// Return array of mata pelajaran
		return guru.mataPelajaran ? [guru.mataPelajaran] : [];
	}

	async findByKelas(kelas: string) {
		return await this.guruRepository
			.createQueryBuilder("guru")
			.where("FIND_IN_SET(:kelas, guru.kelasMapel)", { kelas })
			.orWhere("guru.kelasWali = :kelas", { kelas })
			.getMany();
	}

	async findByMapel(mapelId: number) {
		return await this.guruRepository
			.createQueryBuilder("guru")
			.where("FIND_IN_SET(:mapelId, guru.mataPelajaranIds)", { mapelId })
			.getMany();
	}

	async update(id: number, updateGuruDto: UpdateGuruDto) {
		await this.findOne(id); // Check if exists

		// Check duplicate NIP if being updated
		if (updateGuruDto.nip) {
			const existing = await this.guruRepository.findOne({
				where: { nip: updateGuruDto.nip },
			});

			if (existing && existing.id !== id) {
				throw new BadRequestException("NIP sudah terdaftar");
			}
		}

		await this.guruRepository.update(id, updateGuruDto);
		return await this.findOne(id);
	}

	async remove(id: number) {
		this.logger.log(`[REMOVE] Starting guru deletion for id: ${id}`);

		const guru = await this.findOne(id); // Check if exists + load relations
		this.logger.log(`[REMOVE] Guru found: ${guru.nip} (${guru.namaLengkap})`);
		this.logger.log(
			`[REMOVE] kelasWaliList: ${guru.kelasWaliList?.length || 0} items`,
		);
		this.logger.log(
			`[REMOVE] kelasMapelList: ${guru.kelasMapelList?.length || 0} items`,
		);
		this.logger.log(
			`[REMOVE] kelasMapel array: ${guru.kelasMapel?.length || 0} items`,
		);

		// IMMUTABLE: Check if guru is assigned to any kelas as wali
		if (guru.kelasWaliList && guru.kelasWaliList.length > 0) {
			this.logger.warn(
				`[REMOVE] Guru ${id} is wali for ${guru.kelasWaliList.length} kelas - BLOCKING DELETE`,
			);
			throw new BadRequestException(
				`Guru tidak dapat dihapus karena menjadi wali kelas pada ${guru.kelasWaliList.length} kelas. Silakan hapus assignment wali kelas terlebih dahulu.`,
			);
		}

		// IMMUTABLE: Check if guru is assigned to any kelas as subject teacher
		// Check both the relation AND the simple-array column for robustness
		let assignedKelasCount = 0;

		// Check M:M relationship
		if (guru.kelasMapelList && guru.kelasMapelList.length > 0) {
			this.logger.log(
				`[REMOVE] Found ${guru.kelasMapelList.length} assignments in kelasMapelList relation`,
			);
			assignedKelasCount = guru.kelasMapelList.length;
		}

		// If relation empty but array has data, use array count
		if (
			assignedKelasCount === 0 &&
			guru.kelasMapel &&
			guru.kelasMapel.length > 0
		) {
			this.logger.log(
				`[REMOVE] Found ${guru.kelasMapel.length} assignments in kelasMapel array`,
			);
			assignedKelasCount = guru.kelasMapel.length;
		}

		// Direct database check as fallback
		if (assignedKelasCount === 0) {
			this.logger.log(`[REMOVE] Running DB fallback query for guru ${id}`);
			const dbResult = await this.guruRepository.query(
				"SELECT COUNT(*) as count FROM kelas_guru_mapel WHERE guruId = ?",
				[id],
			);
			assignedKelasCount = dbResult[0]?.count || 0;
			this.logger.log(
				`[REMOVE] DB query returned: ${assignedKelasCount} assignments`,
			);
		}

		if (assignedKelasCount > 0) {
			this.logger.warn(
				`[REMOVE] Guru ${id} has ${assignedKelasCount} mapel assignments - BLOCKING DELETE`,
			);
			throw new BadRequestException(
				`Guru tidak dapat dihapus karena mengajar di ${assignedKelasCount} kelas. Silakan hapus assignment guru mapel terlebih dahulu.`,
			);
		}

		this.logger.log(
			`[REMOVE] All checks passed, proceeding with deletion for guru ${id}`,
		);

		// Clear any kelas where this guru is wali (should be empty now, but safety check)
		const updateWaliResult = await this.guruRepository.query(
			"UPDATE kelas SET guruWaliId = NULL WHERE guruWaliId = ?",
			[id],
		);
		this.logger.log(
			`[REMOVE] Cleared wali assignments: ${
				updateWaliResult.affectedRows || 0
			} rows`,
		);

		// Remove many-to-many associations with kelas (should be empty now, but safety check)
		const deleteMapelResult = await this.guruRepository.query(
			"DELETE FROM kelas_guru_mapel WHERE guruId = ?",
			[id],
		);
		this.logger.log(
			`[REMOVE] Cleared mapel assignments: ${
				deleteMapelResult.affectedRows || 0
			} rows`,
		);

		const deleteResult = await this.guruRepository.delete(id);
		this.logger.log(
			`[REMOVE] Guru deleted successfully. Affected rows: ${deleteResult.affected}`,
		);
		return { success: true, message: "Guru berhasil dihapus" };

		await this.guruRepository.delete(id);
		return { success: true, message: "Guru berhasil dihapus" };
	}

	async importFromExcel(file: Express.Multer.File) {
		if (!file.buffer) {
			throw new BadRequestException("File buffer tidak ditemukan");
		}

		try {
			// Parse Excel file
			const workbook = XLSX.read(file.buffer, { type: "buffer" });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			if (jsonData.length === 0) {
				throw new BadRequestException("File Excel kosong");
			}

			const guruList = jsonData.map((row: any) => ({
				nip: String(row.nip || "").trim(),
				namaLengkap: String(row.nama || "").trim(),
				kelasWali: String(row.kelasWali || ""),
				kelasMapel: (row.kelasMapel || "")
					.toString()
					.split(",")
					.filter((k: string) => k.trim()),
			}));

			// Validate required fields
			for (const item of guruList) {
				if (!item.nip || !item.namaLengkap) {
					throw new BadRequestException(
						"Data tidak lengkap. Pastikan nip dan nama terisi",
					);
				}
			}

			// Check for duplicates
			const nipList = guruList.map((g) => g.nip);
			const uniqueNip = new Set(nipList);

			if (uniqueNip.size !== nipList.length) {
				throw new BadRequestException("Ada duplikasi NIP dalam file");
			}

			// Import to database
			const result = await this.guruRepository.save(guruList);

			return {
				success: true,
				message: `${result.length} guru berhasil diimport`,
				data: result,
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(`Gagal membaca file: ${error.message}`);
		}
	}

	async assignKelas(guruId: number, kelas: string) {
		const guru = await this.findOne(guruId);
		guru.kelasWali = kelas;
		return await this.guruRepository.save(guru);
	}

	async assignMataPelajaran(guruId: number, mapelIds: number[]) {
		const guru = await this.findOne(guruId);
		guru.kelasMapel = mapelIds.map((id) => id.toString());
		return await this.guruRepository.save(guru);
	}
}
