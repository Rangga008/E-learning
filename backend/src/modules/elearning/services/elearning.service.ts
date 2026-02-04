import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { MataPelajaran } from "../entities/mata-pelajaran.entity";
import { Materi } from "../entities/materi.entity";
import { SoalEsai } from "../entities/soal-esai.entity";
import { JawabanEsai } from "../entities/jawaban-esai.entity";
import { Kelas } from "../../kelas/entities/kelas.entity";
import { Guru } from "../../guru/entities/guru.entity";
import { PesertaDidik } from "../../peserta-didik/entities/peserta-didik.entity";

@Injectable()
export class ElearningService {
	constructor(
		@InjectRepository(MataPelajaran)
		private mataPelajaranRepository: Repository<MataPelajaran>,
		@InjectRepository(Materi)
		private materiRepository: Repository<Materi>,
		@InjectRepository(SoalEsai)
		private soalEsaiRepository: Repository<SoalEsai>,
		@InjectRepository(JawabanEsai)
		private jawabanEsaiRepository: Repository<JawabanEsai>,
		@InjectRepository(Kelas)
		private kelasRepository: Repository<Kelas>,
		@InjectRepository(Guru)
		private guruRepository: Repository<Guru>,
		@InjectRepository(PesertaDidik)
		private pesertaDidikRepository: Repository<PesertaDidik>,
	) {}

	// Mata Pelajaran Methods
	async getMataPelajaran() {
		return {
			success: true,
			data: await this.mataPelajaranRepository.find(),
		};
	}

	async getMataPelajaranByKelas(kelasId?: number) {
		// If no kelasId provided, return all mata pelajaran
		if (!kelasId) {
			return {
				success: true,
				data: await this.mataPelajaranRepository.find(),
			};
		}

		// Get the kelas with its guru mapel relations (include guru data)
		const kelas = await this.kelasRepository.findOne({
			where: { id: kelasId },
			relations: ["guruMapel"],
		});

		if (!kelas) {
			throw new NotFoundException("Kelas tidak ditemukan");
		}

		// Get all mata pelajaran with their gurus
		const allMapel = await this.mataPelajaranRepository.find({
			relations: ["guru"],
		});

		// Map guru info to mata pelajaran for this kelas
		if (!kelas.guruMapel || kelas.guruMapel.length === 0) {
			return {
				success: true,
				data: [],
			};
		}

		// Create a map of mataPelajaranId -> guru for quick lookup
		const guruMap: { [key: number]: any } = {};
		kelas.guruMapel.forEach((guru) => {
			if (guru.mataPelajaranId) {
				guruMap[guru.mataPelajaranId] = {
					id: guru.id,
					namaLengkap: guru.namaLengkap,
					nip: guru.nip,
				};
			}
		});

		// Filter and add guru info to mata pelajaran
		const filteredMapel = allMapel
			.filter((mp) => guruMap[mp.id])
			.map((mp) => ({
				...mp,
				guru: guruMap[mp.id],
			}));

		return {
			success: true,
			data: filteredMapel,
		};
	}

	// Create Mata Pelajaran
	async createMataPelajaran(data: any) {
		if (!data.nama) {
			throw new BadRequestException("Nama mata pelajaran harus diisi");
		}

		const mataPelajaran = this.mataPelajaranRepository.create({
			nama: data.nama,
		});

		const result = await this.mataPelajaranRepository.save(mataPelajaran);

		return {
			success: true,
			message: "Mata pelajaran berhasil dibuat",
			data: result,
		};
	}

	// Update Mata Pelajaran
	async updateMataPelajaran(id: number, data: any) {
		const mataPelajaran = await this.mataPelajaranRepository.findOne({
			where: { id },
		});

		if (!mataPelajaran) {
			throw new NotFoundException("Mata pelajaran tidak ditemukan");
		}

		if (data.nama) {
			mataPelajaran.nama = data.nama;
		}

		const result = await this.mataPelajaranRepository.save(mataPelajaran);

		return {
			success: true,
			message: "Mata pelajaran berhasil diperbarui",
			data: result,
		};
	}

	// Delete Mata Pelajaran
	async deleteMataPelajaran(id: number) {
		const mataPelajaran = await this.mataPelajaranRepository.findOne({
			where: { id },
		});

		if (!mataPelajaran) {
			throw new NotFoundException("Mata pelajaran tidak ditemukan");
		}

		// IMMUTABLE: Check if any guru uses this mataPelajaran
		const guruCount = await this.guruRepository.count({
			where: { mataPelajaranId: id },
		});

		if (guruCount > 0) {
			throw new BadRequestException(
				`Mata pelajaran tidak dapat dihapus karena digunakan oleh ${guruCount} guru. Silakan ubah mata pelajaran guru terlebih dahulu.`,
			);
		}

		// IMMUTABLE: Check if any kelas has this mataPelajaran (M:M relationship)
		const kelasWithMapel = await this.kelasRepository
			.createQueryBuilder("kelas")
			.leftJoinAndSelect("kelas.mataPelajaran", "mapel")
			.where("mapel.id = :mapelId", { mapelId: id })
			.getCount();

		if (kelasWithMapel > 0) {
			throw new BadRequestException(
				`Mata pelajaran tidak dapat dihapus karena sudah ditambahkan ke ${kelasWithMapel} kelas.`,
			);
		}

		await this.mataPelajaranRepository.delete(id);

		return {
			success: true,
			message: "Mata pelajaran berhasil dihapus",
		};
	}
	async getMateriByMapel(mataPelajaranId: number) {
		const materi = await this.materiRepository.find({
			where: { mataPelajaranId },
			order: { createdAt: "DESC" },
		});

		if (!materi.length) {
			throw new NotFoundException(
				"Materi tidak ditemukan untuk mata pelajaran ini",
			);
		}

		return {
			success: true,
			data: materi,
		};
	}

	// Get all materi for admin (from all gurus)
	async findAllForAdmin() {
		const materi = await this.materiRepository.find({
			relations: ["mataPelajaran"],
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: materi,
		};
	}

	async createMateri(data: any) {
		if (!data.mataPelajaranId || !data.judul) {
			throw new BadRequestException("mataPelajaranId dan judul harus diisi");
		}

		const materi = this.materiRepository.create(data);
		const result = await this.materiRepository.save(materi);

		return {
			success: true,
			message: "Materi berhasil dibuat",
			data: result,
		};
	}

	async updateMateri(id: number, data: any) {
		const materi = await this.materiRepository.findOne({ where: { id } });

		if (!materi) {
			throw new NotFoundException("Materi tidak ditemukan");
		}

		await this.materiRepository.update(id, data);
		return {
			success: true,
			message: "Materi berhasil diperbarui",
			data: await this.materiRepository.findOne({ where: { id } }),
		};
	}

	// Soal Esai Methods
	async getSoalEsaiByMateri(materiId: number) {
		const soal = await this.soalEsaiRepository.find({
			where: { materiId },
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: soal,
		};
	}

	async createSoalEsai(data: any) {
		if (!data.materiId || !data.pertanyaan) {
			throw new BadRequestException("materiId dan pertanyaan harus diisi");
		}

		const soal = this.soalEsaiRepository.create(data);
		const result = await this.soalEsaiRepository.save(soal);

		return {
			success: true,
			message: "Soal esai berhasil dibuat",
			data: result,
		};
	}

	async updateSoalEsai(id: number, data: any) {
		const soal = await this.soalEsaiRepository.findOne({ where: { id } });

		if (!soal) {
			throw new NotFoundException("Soal esai tidak ditemukan");
		}

		await this.soalEsaiRepository.update(id, data);
		return {
			success: true,
			message: "Soal esai berhasil diperbarui",
			data: await this.soalEsaiRepository.findOne({ where: { id } }),
		};
	}

	// Jawaban Esai Methods
	async submitJawaban(
		pesertaDidikId: number,
		soalEsaiId: number,
		jawaban: string,
	) {
		const soal = await this.soalEsaiRepository.findOne({
			where: { id: soalEsaiId },
		});

		if (!soal) {
			throw new NotFoundException("Soal tidak ditemukan");
		}

		const jawabanEsai = this.jawabanEsaiRepository.create({
			pesertaDidikId,
			soalEsaiId,
			jawaban,
			sudahDinilai: false,
		});

		const result = await this.jawabanEsaiRepository.save(jawabanEsai);

		return {
			success: true,
			message: "Jawaban berhasil dikirim",
			data: result,
		};
	}

	async getJawabanPerluDiperiksa() {
		const jawaban = await this.jawabanEsaiRepository.find({
			where: { sudahDinilai: false },
			relations: ["soalEsai"],
			order: { createdAt: "ASC" },
		});

		return {
			success: true,
			data: jawaban,
			total: jawaban.length,
		};
	}

	async getJawabanBySiswa(pesertaDidikId: number) {
		const jawaban = await this.jawabanEsaiRepository.find({
			where: { pesertaDidikId },
			relations: ["soalEsai"],
			order: { createdAt: "DESC" },
		});

		return {
			success: true,
			data: jawaban,
			total: jawaban.length,
		};
	}

	async nilaiJawaban(jawabanId: number, nilai: number, catatan?: string) {
		const jawaban = await this.jawabanEsaiRepository.findOne({
			where: { id: jawabanId },
		});

		if (!jawaban) {
			throw new NotFoundException("Jawaban tidak ditemukan");
		}

		await this.jawabanEsaiRepository.update(jawabanId, {
			nilai,
			sudahDinilai: true,
			catatanGuru: catatan || "",
		});

		return {
			success: true,
			message: "Jawaban berhasil dinilai",
			data: await this.jawabanEsaiRepository.findOne({
				where: { id: jawabanId },
			}),
		};
	}

	// ============= Additional Soal Esai Methods =============
	async getSoalEsaiById(id: number) {
		const soal = await this.soalEsaiRepository.findOne({
			where: { id },
			relations: ["materi"],
		});

		if (!soal) {
			throw new NotFoundException("Soal esai tidak ditemukan");
		}

		return {
			success: true,
			data: soal,
		};
	}

	async getSoalEsaiByTugas(tugasId: number) {
		const soal = await this.soalEsaiRepository
			.createQueryBuilder("soal")
			.where("soal.tugasId = :tugasId", { tugasId })
			.orderBy("soal.createdAt", "ASC")
			.getMany();

		return {
			success: true,
			data: soal,
			total: soal.length,
		};
	}

	async deleteSoalEsai(id: number) {
		const soal = await this.soalEsaiRepository.findOne({ where: { id } });

		if (!soal) {
			throw new NotFoundException("Soal esai tidak ditemukan");
		}

		// Delete all jawaban for this soal
		await this.jawabanEsaiRepository.delete({ soalEsaiId: id });

		// Delete soal
		await this.soalEsaiRepository.remove(soal);

		return {
			success: true,
			message: "Soal esai berhasil dihapus",
		};
	}

	async createJawabanEsai(pesertaDidikId: number, data: any) {
		const jawabanEsai = this.jawabanEsaiRepository.create({
			pesertaDidikId,
			soalEsaiId: data.soalEsaiId,
			jawaban: data.jawaban,
			sudahDinilai: false,
		});

		const result = await this.jawabanEsaiRepository.save(jawabanEsai);

		return {
			success: true,
			message: "Jawaban berhasil dikirim",
			data: result,
		};
	}

	async getJawabanEsaiBySoal(soalEsaiId: number) {
		const jawaban = await this.jawabanEsaiRepository.find({
			where: { soalEsaiId },
			relations: ["pesertaDidik"],
			order: { createdAt: "ASC" },
		});

		return {
			success: true,
			data: jawaban,
			total: jawaban.length,
		};
	}

	/**
	 * Get all jawaban esai submissions for a tugas
	 * Groups by student and includes all their answers
	 */
	async getJawabanEsaiByTugas(tugasId: number) {
		// Get all soal esai for this tugas
		const soalList = await this.soalEsaiRepository.find({
			where: { tugasId },
		});

		if (soalList.length === 0) {
			return {
				success: true,
				data: [],
				message: "No questions found for this task",
			};
		}

		const soalIds = soalList.map((s) => s.id);

		// Get all jawaban esai for these soal
		const jawabanList = await this.jawabanEsaiRepository.find({
			where: { soalEsaiId: In(soalIds) },
			relations: ["soalEsai"],
			order: { pesertaDidikId: "ASC", createdAt: "ASC" },
		});

		// Get unique student IDs
		const studentIds = [...new Set(jawabanList.map((j) => j.pesertaDidikId))];

		// Get student details
		const students = await this.pesertaDidikRepository.find({
			where: { id: In(studentIds) },
		});

		// Create a map for easy lookup
		const studentMap = new Map(students.map((s) => [s.id, s]));

		// Group by peserta didik
		const grouped: any = {};
		jawabanList.forEach((jawaban) => {
			const studentId = jawaban.pesertaDidikId;
			if (!grouped[studentId]) {
				const student = studentMap.get(studentId);
				grouped[studentId] = {
					pesertaDidikId: studentId,
					namaLengkap: student?.namaLengkap || "Unknown",
					nisn: student?.nisn || "",
					soalJawaban: [],
					totalNilai: 0,
					sudahDinilaiSemua: true,
				};
			}
			grouped[studentId].soalJawaban.push(jawaban);

			// Check if all are graded
			if (!jawaban.sudahDinilai) {
				grouped[studentId].sudahDinilaiSemua = false;
			}

			// Calculate total value
			if (jawaban.nilai) {
				grouped[studentId].totalNilai += jawaban.nilai;
			}
		});

		const result = Object.values(grouped);

		return {
			success: true,
			data: result,
			total: result.length,
		};
	}

	async nilaiJawabanEsai(
		id: number,
		data: { nilai: number; feedback?: string },
	) {
		const jawaban = await this.jawabanEsaiRepository.findOne({ where: { id } });

		if (!jawaban) {
			throw new NotFoundException("Jawaban tidak ditemukan");
		}

		await this.jawabanEsaiRepository.update(id, {
			nilai: data.nilai,
			sudahDinilai: true,
			catatanGuru: data.feedback || "",
		});

		return {
			success: true,
			message: "Jawaban berhasil dinilai",
			data: await this.jawabanEsaiRepository.findOne({
				where: { id },
			}),
		};
	}
}
