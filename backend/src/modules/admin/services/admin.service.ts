import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User, UserRole } from "@/modules/auth/entities/user.entity";
import { PesertaDidik } from "@/modules/peserta-didik/entities/peserta-didik.entity";
import { Guru } from "@/modules/guru/entities/guru.entity";
import { Kelas } from "@/modules/kelas/entities/kelas.entity";
import { PesertaDidikService } from "@/modules/peserta-didik/services/peserta-didik.service";
import { GuruService } from "@/modules/guru/services/guru.service";

@Injectable()
export class AdminService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(PesertaDidik)
		private pesertaDidikRepository: Repository<PesertaDidik>,
		@InjectRepository(Guru)
		private guruRepository: Repository<Guru>,
		@InjectRepository(Kelas)
		private kelasRepository: Repository<Kelas>,
		private pesertaDidikService: PesertaDidikService,
		private guruService: GuruService,
	) {}

	// ============ STATISTICS ============
	async getSystemStatistics() {
		const totalSiswa = await this.pesertaDidikRepository.count();
		const totalGuru = await this.guruRepository.count();
		const totalUserAktif = await this.userRepository.count({
			where: { isActive: true },
		});

		return {
			success: true,
			data: {
				totalSiswa,
				totalGuru,
				totalUserAktif,
				totalUser: await this.userRepository.count(),
			},
		};
	}

	// ============ USER MANAGEMENT ============
	async getAllUsers(
		page: number = 1,
		limit: number = 10,
		search?: string,
		role?: string,
	) {
		const skip = (page - 1) * limit;
		let query = this.userRepository.createQueryBuilder("user");

		if (search) {
			query = query.where(
				"user.username LIKE :search OR user.email LIKE :search OR user.fullName LIKE :search",
				{ search: `%${search}%` },
			);
		}

		if (role) {
			query = query.andWhere("user.role = :role", { role });
		}

		query = query.orderBy("user.createdAt", "DESC").skip(skip).take(limit);

		const [users, total] = await query.getManyAndCount();

		return {
			success: true,
			data: users.map((u) => ({
				...u,
				password: undefined,
			})),
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		};
	}

	async getUserById(userId: number) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException("User tidak ditemukan");
		}

		return {
			success: true,
			data: { ...user, password: undefined },
		};
	}

	async updateUserStatus(userId: number, isActive: boolean) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException("User tidak ditemukan");
		}

		user.isActive = isActive;
		await this.userRepository.save(user);

		return {
			success: true,
			message: `User berhasil di-${isActive ? "aktifkan" : "nonaktifkan"}`,
		};
	}

	async resetUserPassword(userId: number, newPassword: string) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException("User tidak ditemukan");
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await this.userRepository.save(user);

		return {
			success: true,
			message: "Password user berhasil direset",
		};
	}

	// ============ STUDENT MANAGEMENT ============
	async getAllStudents(page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;
		const [students, total] = await this.pesertaDidikRepository.findAndCount({
			relations: ["kelas", "kelas.tingkatRef"],
			skip,
			take: limit,
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: students,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		};
	}

	async getAvailableStudents() {
		const students = await this.pesertaDidikRepository.find({
			where: { kelasId: null },
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: students,
		};
	}

	async getStudentById(studentId: number) {
		const student = await this.pesertaDidikRepository.findOne({
			where: { id: studentId },
			relations: ["user", "kelas", "kelas.tingkatRef"],
		});

		if (!student) {
			throw new NotFoundException("Peserta didik tidak ditemukan");
		}

		return {
			success: true,
			data: student,
		};
	}

	async updateStudentProfile(
		studentId: number,
		updateData: {
			namaLengkap?: string;
			nisn?: string;
			nipd?: string;
			kelas?: string;
			jenisKelamin?: string;
		},
	) {
		const student = await this.pesertaDidikRepository.findOne({
			where: { id: studentId },
		});

		if (!student) {
			throw new NotFoundException("Peserta didik tidak ditemukan");
		}

		Object.assign(student, updateData);
		await this.pesertaDidikRepository.save(student);

		return {
			success: true,
			message: "Profil peserta didik berhasil diupdate",
			data: student,
		};
	}

	async resetUserLevel(pesertaDidikId: number) {
		const pesertaDidik = await this.pesertaDidikRepository.findOne({
			where: { id: pesertaDidikId },
		});

		if (!pesertaDidik) {
			throw new NotFoundException("Peserta didik tidak ditemukan");
		}

		pesertaDidik.level = 1;
		pesertaDidik.poin = 0;

		await this.pesertaDidikRepository.save(pesertaDidik);
		return { success: true, message: "User level berhasil direset" };
	}

	async resetStudentPassword(pesertaDidikId: number, customPassword?: string) {
		const pesertaDidik = await this.pesertaDidikRepository.findOne({
			where: { id: pesertaDidikId },
		});

		if (!pesertaDidik) {
			throw new NotFoundException("Peserta didik tidak ditemukan");
		}

		const user = await this.userRepository.findOne({
			where: { id: pesertaDidik.userId },
		});

		if (!user) {
			throw new NotFoundException("User tidak ditemukan");
		}

		// Use custom password or reset to NISN
		const passwordToUse = customPassword || pesertaDidik.nisn;
		const hashedPassword = await bcrypt.hash(passwordToUse, 10);
		user.password = hashedPassword;

		await this.userRepository.save(user);
		return {
			success: true,
			message: customPassword
				? "Password siswa berhasil diubah"
				: "Password siswa berhasil direset ke NISN",
		};
	}

	// ============ TEACHER MANAGEMENT ============
	async getAllTeachers(page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;
		const [teachers, total] = await this.guruRepository.findAndCount({
			relations: [
				"kelasWaliList",
				"kelasWaliList.tingkatRef",
				"kelasMapelList",
				"kelasMapelList.tingkatRef",
				"mataPelajaran",
			],
			skip,
			take: limit,
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: teachers,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		};
	}

	async getTeacherById(teacherId: number) {
		const teacher = await this.guruRepository.findOne({
			where: { id: teacherId },
			relations: [
				"user",
				"kelasWaliList",
				"kelasWaliList.tingkatRef",
				"kelasMapelList",
				"kelasMapelList.tingkatRef",
			],
		});

		if (!teacher) {
			throw new NotFoundException("Guru tidak ditemukan");
		}

		return {
			success: true,
			data: teacher,
		};
	}

	async getTeachersForDropdown() {
		const teachers = await this.guruRepository.find({
			select: ["id", "nip", "namaLengkap", "mataPelajaranId"],
			relations: ["mataPelajaran"],
			order: { namaLengkap: "ASC" },
		});

		return {
			success: true,
			data: teachers,
		};
	}

	async getKelasTeachers(kelasId: number) {
		// Get kelas with guru mapel (ManyToMany)
		const kelas = await this.kelasRepository.findOne({
			where: { id: kelasId },
			relations: ["guruMapel", "guruWali"],
		});

		if (!kelas) {
			throw new NotFoundException("Kelas tidak ditemukan");
		}

		return {
			success: true,
			data: {
				guruWali: kelas.guruWali || null,
				guruMapel: kelas.guruMapel || [],
			},
		};
	}

	async updateTeacherProfile(
		teacherId: number,
		updateData: {
			namaLengkap?: string;
			nip?: string;
			kelasWali?: string;
			kelasMapel?: string;
		},
	) {
		const teacher = await this.guruRepository.findOne({
			where: { id: teacherId },
		});

		if (!teacher) {
			throw new NotFoundException("Guru tidak ditemukan");
		}

		Object.assign(teacher, updateData);
		await this.guruRepository.save(teacher);

		return {
			success: true,
			message: "Profil guru berhasil diupdate",
			data: teacher,
		};
	}

	// ============ SYSTEM MANAGEMENT ============
	async resetSystem(tanggal: Date) {
		// TODO: Reset system (hapus nilai, reset level, tapi akun tetap ada)
		return { success: true, message: "System reset successfully" };
	}

	async getSystemSettings() {
		return {
			success: true,
			data: {
				appName: "LMS Sanggar Belajar",
				version: "1.0.0",
				maintenanceMode: false,
			},
		};
	}

	async updateSystemSettings(settings: any) {
		// TODO: Update system settings to database
		return {
			success: true,
			message: "Settings updated successfully",
			data: settings,
		};
	}

	async viewSystemLogs() {
		// TODO: Implement system logs viewer
		return { success: true, data: [] };
	}

	async getUserCount() {
		const total = await this.userRepository.count();
		const active = await this.userRepository.count({
			where: { isActive: true },
		});
		const inactive = total - active;

		return {
			success: true,
			data: {
				total,
				active,
				inactive,
			},
		};
	}

	async deactivateUser(userId: number) {
		const user = await this.userRepository.findOne({ where: { id: userId } });

		if (!user) {
			throw new NotFoundException("User tidak ditemukan");
		}

		user.isActive = false;
		await this.userRepository.save(user);

		return { success: true, message: "User berhasil dinonaktifkan" };
	}

	async activateUser(userId: number) {
		const user = await this.userRepository.findOne({ where: { id: userId } });

		if (!user) {
			throw new NotFoundException("User tidak ditemukan");
		}

		user.isActive = true;
		await this.userRepository.save(user);

		return { success: true, message: "User berhasil diaktifkan" };
	}

	async createUser(body: any) {
		// Validate required fields
		if (!body.username || !body.email || !body.fullName || !body.password) {
			throw new BadRequestException(
				"Username, Email, Nama Lengkap, dan Password harus diisi",
			);
		}

		// Check if user already exists
		const existingUser = await this.userRepository.findOne({
			where: [{ username: body.username }, { email: body.email }],
		});

		if (existingUser) {
			throw new BadRequestException("Username atau email sudah terdaftar");
		}

		// Validate role-specific required fields
		if (body.role === "siswa" && !body.nisn) {
			throw new BadRequestException("NISN harus diisi untuk siswa");
		}
		if (body.role === "guru" && !body.nip) {
			throw new BadRequestException("NIP harus diisi untuk guru");
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(body.password, 10);

		// Create user entity
		const user = this.userRepository.create({
			username: body.username,
			email: body.email,
			password: hashedPassword,
			fullName: body.fullName,
			role: body.role || "siswa",
			isActive: true,
		});

		// Save to database
		const savedUser = (await this.userRepository.save(user)) as unknown as User;

		// Jika role siswa, buat data di peserta_didik
		if (body.role === "siswa") {
			// Handle both 'kelas' (from form) and 'kelasId' field names
			const kelasId =
				body.kelasId || (body.kelas ? parseInt(body.kelas) : null);

			const pesertaDidik = this.pesertaDidikRepository.create({
				nisn: body.nisn,
				namaLengkap: body.fullName,
				jenisKelamin: body.jenisKelamin || "L",
				kelasId: kelasId,
				userId: savedUser.id,
			});
			await this.pesertaDidikRepository.save(pesertaDidik);
		}

		// Jika role guru, buat data di guru
		if (body.role === "guru") {
			// Handle kelasMapel - can be array of numbers or comma-separated string
			// These are mata pelajaran IDs that the guru teaches
			let kelasMapelArray: string[] = [];
			if (Array.isArray(body.kelasMapel)) {
				kelasMapelArray = body.kelasMapel.map((id: any) => String(id));
			} else if (typeof body.kelasMapel === "string") {
				kelasMapelArray = body.kelasMapel ? body.kelasMapel.split(",") : [];
			}

			// Handle kelasWali - can be number or string (kelas ID for homeroom)
			const kelasWaliId =
				body.kelasWaliId || body.kelasWali
					? String(body.kelasWaliId || body.kelasWali)
					: "";

			const guru = this.guruRepository.create({
				nip: body.nip,
				namaLengkap: body.fullName,
				kelasWali: kelasWaliId,
				kelasMapel: kelasMapelArray,
				userId: savedUser.id,
			});
			await this.guruRepository.save(guru);
		}

		// Return user tanpa password
		const { password, ...result } = savedUser;
		return {
			success: true,
			message: "User berhasil dibuat",
			data: result,
		};
	}

	async updateUser(userId: number, body: any) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new BadRequestException("User tidak ditemukan");
		}

		if (body.username) user.username = body.username;
		if (body.email) user.email = body.email;
		if (body.fullName) user.fullName = body.fullName;
		if (body.role) user.role = body.role;

		await this.userRepository.save(user);
		const { password, ...result } = user;
		return { success: true, message: "User berhasil diperbarui", data: result };
	}

	async deleteUser(userId: number) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new BadRequestException("User tidak ditemukan");
		}

		// Hapus record terkait berdasarkan role
		if (user.role === "siswa") {
			await this.pesertaDidikRepository.delete({ userId: userId });
		} else if (user.role === "guru") {
			await this.guruRepository.delete({ userId: userId });
		}

		await this.userRepository.remove(user);
		return { success: true, message: "User berhasil dihapus" };
	}

	async createStudent(body: any) {
		const result = await this.pesertaDidikService.create({
			nisn: body.nisn,
			namaLengkap: body.namaLengkap,
			jenisKelamin: body.jenisKelamin || "L",
			nipd: body.nipd || null,
			kelasId: body.kelas || body.kelasId, // Accept both kelas (string) and kelasId (number)
		});

		return {
			success: true,
			message: "Siswa berhasil ditambahkan",
			data: result,
		};
	}

	async createTeacher(body: any) {
		const result = await this.guruService.create({
			nip: body.nip,
			namaLengkap: body.namaLengkap,
			mataPelajaranId: body.mataPelajaranId || null,
		});

		return {
			success: true,
			message: "Guru berhasil ditambahkan",
			data: result,
		};
	}

	async deleteStudent(studentId: number) {
		const student = await this.pesertaDidikRepository.findOne({
			where: { id: studentId },
		});
		if (!student) {
			throw new BadRequestException("Siswa tidak ditemukan");
		}

		// Delete using service to handle cascades
		return await this.pesertaDidikService.remove(studentId);
	}

	async deleteTeacher(teacherId: number) {
		const teacher = await this.guruRepository.findOne({
			where: { id: teacherId },
			relations: ["kelasWaliList", "kelasMapelList"],
		});
		if (!teacher) {
			throw new BadRequestException("Guru tidak ditemukan");
		}

		// Delete using service to handle cascades and immutability checks
		return await this.guruService.remove(teacherId);
	}

	async assignWaliGuruToKelas(kelasId: number, guruId: number) {
		try {
			// Find kelas with guruMapel relation
			const kelas = await this.kelasRepository.findOne({
				where: { id: kelasId },
				relations: ["guruMapel"],
			});

			if (!kelas) {
				return { success: false, message: "Kelas tidak ditemukan" };
			}

			// Find guru
			const guru = await this.guruRepository.findOne({
				where: { id: guruId },
			});

			if (!guru) {
				return { success: false, message: "Guru tidak ditemukan" };
			}

			// Set guru as wali kelas
			kelas.guruWaliId = guruId;

			// If guru has mata pelajaran, add it to kelas guruMapel
			if (guru.mataPelajaranId) {
				// Initialize guruMapel if not exists
				if (!kelas.guruMapel) {
					kelas.guruMapel = [];
				}

				// Check if guru is already in guruMapel
				const guruExists = kelas.guruMapel.some((g) => g.id === guruId);

				if (!guruExists) {
					kelas.guruMapel.push(guru);
				}
			}

			// Save kelas
			await this.kelasRepository.save(kelas);

			return {
				success: true,
				message: "Guru berhasil diassign sebagai wali kelas",
				data: kelas,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message || "Gagal mengassign guru",
			};
		}
	}

	// ============ IMPORT MANAGEMENT ============
	async importStudents(data: any[]) {
		const results = {
			success: 0,
			failed: 0,
			errors: [] as string[],
		};

		for (let i = 0; i < data.length; i++) {
			try {
				const row = data[i];
				const nisn = String(row.nisn || "").trim();
				const namaLengkap = String(row.namaLengkap || "").trim();
				const jenisKelamin = String(row.jenisKelamin || "")
					.trim()
					.toUpperCase();
				const password = String(row.password || "").trim();
				const kelasId = row.kelasId ? parseInt(row.kelasId) : null;

				// Validation
				if (!nisn || nisn.length < 1) {
					results.failed++;
					results.errors.push(`Baris ${i + 2}: NISN tidak valid`);
					continue;
				}

				if (!namaLengkap || namaLengkap.length < 3) {
					results.failed++;
					results.errors.push(
						`Baris ${i + 2}: Nama lengkap minimal 3 karakter`,
					);
					continue;
				}

				if (!["L", "P"].includes(jenisKelamin)) {
					results.failed++;
					results.errors.push(`Baris ${i + 2}: Jenis Kelamin harus L atau P`);
					continue;
				}

				if (!password || password.length < 6) {
					results.failed++;
					results.errors.push(`Baris ${i + 2}: Password minimal 6 karakter`);
					continue;
				}

				// Check if student already exists
				const existingStudent = await this.pesertaDidikRepository.findOne({
					where: { nisn },
				});

				if (existingStudent) {
					results.failed++;
					results.errors.push(`Baris ${i + 2}: NISN ${nisn} sudah terdaftar`);
					continue;
				}

				// Create user first
				const hashedPassword = await bcrypt.hash(password, 10);
				const user = this.userRepository.create({
					username: nisn,
					email: `${nisn}@siswa.local`,
					password: hashedPassword,
					role: UserRole.SISWA,
					isActive: true,
				});

				const savedUser = await this.userRepository.save(user);

				// Create student
				const student = this.pesertaDidikRepository.create({
					nisn,
					namaLengkap,
					jenisKelamin,
					userId: savedUser.id,
				});

				// If kelasId provided, assign it
				if (kelasId) {
					student.kelasId = kelasId;
				}

				await this.pesertaDidikRepository.save(student);
				results.success++;
			} catch (error) {
				results.failed++;
				results.errors.push(
					`Baris ${i + 2}: ${error.message || "Gagal mengimport"}`,
				);
			}
		}

		return {
			success: true,
			message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
			data: results,
		};
	}

	async importTeachers(data: any[]) {
		const results = {
			success: 0,
			failed: 0,
			errors: [] as string[],
		};

		for (let i = 0; i < data.length; i++) {
			try {
				const row = data[i];
				const nip = String(row.nip || "").trim();
				const namaLengkap = String(row.namaLengkap || "").trim();
				const password = String(row.password || "").trim();
				const mataPelajaranId = row.mataPelajaranId
					? parseInt(row.mataPelajaranId)
					: null;

				// Validation
				if (!nip || nip.length < 5) {
					results.failed++;
					results.errors.push(`Baris ${i + 2}: NIP tidak valid`);
					continue;
				}

				if (!namaLengkap || namaLengkap.length < 3) {
					results.failed++;
					results.errors.push(
						`Baris ${i + 2}: Nama lengkap minimal 3 karakter`,
					);
					continue;
				}

				if (!password || password.length < 6) {
					results.failed++;
					results.errors.push(`Baris ${i + 2}: Password minimal 6 karakter`);
					continue;
				}

				// Check if teacher already exists
				const existingTeacher = await this.guruRepository.findOne({
					where: { nip },
				});

				if (existingTeacher) {
					results.failed++;
					results.errors.push(`Baris ${i + 2}: NIP ${nip} sudah terdaftar`);
					continue;
				}

				// Create user first
				const hashedPassword = await bcrypt.hash(password, 10);
				const user = this.userRepository.create({
					username: nip,
					email: `${nip}@guru.local`,
					password: hashedPassword,
					role: UserRole.GURU,
					isActive: true,
				});

				const savedUser = await this.userRepository.save(user);

				// Create teacher
				const teacher = this.guruRepository.create({
					nip,
					namaLengkap,
					userId: savedUser.id,
					mataPelajaranId: mataPelajaranId || null,
				});

				await this.guruRepository.save(teacher);
				results.success++;
			} catch (error) {
				results.failed++;
				results.errors.push(
					`Baris ${i + 2}: ${error.message || "Gagal mengimport"}`,
				);
			}
		}

		return {
			success: true,
			message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
			data: results,
		};
	}
}
