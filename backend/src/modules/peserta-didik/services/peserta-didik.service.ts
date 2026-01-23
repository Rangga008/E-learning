import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PesertaDidik } from "../entities/peserta-didik.entity";
import { CreatePesertaDidikDto } from "../dtos/create-peserta-didik.dto";
import { UpdatePesertaDidikDto } from "../dtos/update-peserta-didik.dto";
import { User, UserRole } from "../../auth/entities/user.entity";
import * as bcrypt from "bcryptjs";
const XLSX = require("xlsx");

@Injectable()
export class PesertaDidikService {
	constructor(
		@InjectRepository(PesertaDidik)
		private pesertaDidikRepository: Repository<PesertaDidik>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async create(createPesertaDidikDto: CreatePesertaDidikDto) {
		// Check for duplicate NISN or NIPD
		const existing = await this.pesertaDidikRepository.findOne({
			where: [
				{ nisn: createPesertaDidikDto.nisn },
				{ nipd: createPesertaDidikDto.nipd },
			],
		});

		if (existing) {
			throw new BadRequestException("NISN atau NIPD sudah terdaftar");
		}

		// Generate username and password for auto-created user
		const username = createPesertaDidikDto.nisn; // Use NISN as username
		const password = createPesertaDidikDto.nisn; // NISN as default password
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
				fullName: createPesertaDidikDto.namaLengkap,
				role: UserRole.SISWA,
				isActive: true,
			});
			savedUser = await this.userRepository.save(user);
		}

		// Create peserta didik with userId
		const pesertaDidik = this.pesertaDidikRepository.create({
			...createPesertaDidikDto,
			userId: savedUser.id,
		});

		return await this.pesertaDidikRepository.save(pesertaDidik);
	}

	async findAll(page: number = 1, limit: number = 10, search?: string) {
		let query = this.pesertaDidikRepository.createQueryBuilder("pd");

		// Join with user to search by name
		query = query
			.leftJoinAndSelect("pd.kelas", "kelas")
			.leftJoinAndSelect("kelas.tingkatRef", "tingkatRef");

		// Apply search filter if provided
		if (search && search.trim()) {
			query = query.where(
				"pd.namaLengkap LIKE :search OR pd.nisn LIKE :search OR pd.nipd LIKE :search",
				{ search: `%${search}%` },
			);
		}

		const [data, total] = await query
			.skip((page - 1) * limit)
			.take(limit)
			.orderBy("pd.id", "DESC")
			.getManyAndCount();

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
		const pesertaDidik = await this.pesertaDidikRepository.findOne({
			where: { id },
			relations: ["kelas", "kelas.tingkatRef"],
		});

		if (!pesertaDidik) {
			throw new NotFoundException("Peserta didik tidak ditemukan");
		}

		return pesertaDidik;
	}

	async findByKelas(kelasId: number) {
		return await this.pesertaDidikRepository.find({
			where: { kelasId },
			relations: ["kelas", "kelas.tingkatRef"],
			order: { namaLengkap: "ASC" },
		});
	}

	async findByNISN(nisn: string) {
		return await this.pesertaDidikRepository.findOne({
			where: { nisn },
		});
	}

	async findAvailable() {
		return await this.pesertaDidikRepository.find({
			where: { kelasId: null },
			order: { namaLengkap: "ASC" },
		});
	}

	async update(id: number, updatePesertaDidikDto: UpdatePesertaDidikDto) {
		await this.findOne(id); // Check if exists

		// Check duplicate NISN/NIPD if being updated
		if (updatePesertaDidikDto.nisn || updatePesertaDidikDto.nipd) {
			const existing = await this.pesertaDidikRepository.findOne({
				where: [
					{ nisn: updatePesertaDidikDto.nisn },
					{ nipd: updatePesertaDidikDto.nipd },
				],
			});

			if (existing && existing.id !== id) {
				throw new BadRequestException("NISN atau NIPD sudah terdaftar");
			}
		}

		await this.pesertaDidikRepository.update(id, updatePesertaDidikDto);
		return await this.findOne(id);
	}

	async remove(id: number) {
		await this.findOne(id); // Check if exists
		await this.pesertaDidikRepository.delete(id);
		return { success: true, message: "Peserta didik berhasil dihapus" };
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

			const pesertaDidikList = jsonData.map((row: any) => ({
				nisn: String(row.nisn || "").trim(),
				nipd: String(row.nipd || "").trim(),
				nama: String(row.nama || "").trim(),
				kelas: String(row.kelas || "").trim(),
				level: parseInt(row.level) || 1,
				poin: parseInt(row.poin) || 0,
				absenBerhitung: parseInt(row.absenBerhitung) || 0,
			}));

			// Validate required fields
			for (const item of pesertaDidikList) {
				if (!item.nisn || !item.nipd || !item.nama || !item.kelas) {
					throw new BadRequestException(
						"Data tidak lengkap. Pastikan nisn, nipd, nama, dan kelas terisi",
					);
				}
			}

			// Check for duplicates
			const nisdnList = pesertaDidikList.map((p) => p.nisn);
			const uniqueNisn = new Set(nisdnList);

			if (uniqueNisn.size !== nisdnList.length) {
				throw new BadRequestException("Ada duplikasi NISN dalam file");
			}

			// Import to database
			const result = await this.pesertaDidikRepository.save(pesertaDidikList);

			return {
				success: true,
				message: `${result.length} peserta didik berhasil diimport`,
				data: result,
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(`Gagal membaca file: ${error.message}`);
		}
	}

	async addPoin(pesertaDidikId: number, jumlahPoin: number) {
		const pesertaDidik = await this.findOne(pesertaDidikId);
		pesertaDidik.poin += jumlahPoin;

		// Check level up (tier logic)
		const newLevel = Math.floor(pesertaDidik.poin / 100) + 1;
		if (newLevel > pesertaDidik.level) {
			pesertaDidik.level = newLevel;
		}

		return await this.pesertaDidikRepository.save(pesertaDidik);
	}

	async getTopStudents(limit: number = 10) {
		return await this.pesertaDidikRepository.find({
			order: { poin: "DESC" },
			take: limit,
		});
	}

	async getStudentsByLevel(level: number) {
		return await this.pesertaDidikRepository.find({
			where: { level },
			order: { poin: "DESC" },
		});
	}
}
