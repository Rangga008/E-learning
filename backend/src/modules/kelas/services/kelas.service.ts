import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Kelas } from "../entities/kelas.entity";
import { Guru } from "../../guru/entities/guru.entity";
import { PesertaDidik } from "../../peserta-didik/entities/peserta-didik.entity";

@Injectable()
export class KelasService {
	constructor(
		@InjectRepository(Kelas)
		private kelasRepository: Repository<Kelas>,
		@InjectRepository(Guru)
		private guruRepository: Repository<Guru>,
		@InjectRepository(PesertaDidik)
		private pesertaDidikRepository: Repository<PesertaDidik>,
	) {}

	// Get all classes with relations
	async getAllKelas(page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;
		const [kelas, total] = await this.kelasRepository
			.createQueryBuilder("kelas")
			.leftJoinAndSelect("kelas.guruWali", "guruWali")
			.leftJoinAndSelect("guruWali.mataPelajaran", "waliMapel")
			.leftJoinAndSelect("kelas.siswa", "siswa")
			.leftJoinAndSelect("kelas.guruMapel", "guruMapel")
			.leftJoinAndSelect("guruMapel.mataPelajaran", "guruMapelMapel")
			.leftJoinAndSelect("kelas.mataPelajaran", "mataPelajaran")
			.leftJoinAndSelect("kelas.tingkatRef", "tingkat")
			.skip(skip)
			.take(limit)
			.orderBy("kelas.createdAt", "DESC")
			.getManyAndCount();

		return {
			success: true,
			data: kelas,
			pagination: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
			},
		};
	}

	// Get single class by ID
	async getKelasById(id: number) {
		const kelas = await this.kelasRepository
			.createQueryBuilder("kelas")
			.where("kelas.id = :id", { id })
			.leftJoinAndSelect("kelas.guruWali", "guruWali")
			.leftJoinAndSelect("guruWali.mataPelajaran", "waliMapel")
			.leftJoinAndSelect("kelas.siswa", "siswa")
			.leftJoinAndSelect("kelas.guruMapel", "guruMapel")
			.leftJoinAndSelect("guruMapel.mataPelajaran", "guruMapelMapel")
			.leftJoinAndSelect("kelas.mataPelajaran", "mataPelajaran")
			.leftJoinAndSelect("kelas.tingkatRef", "tingkat")
			.getOne();

		if (!kelas) {
			return { success: false, message: "Kelas tidak ditemukan" };
		}

		return {
			success: true,
			data: kelas,
		};
	}

	// Create new class
	async createKelas(data: any) {
		try {
			let tingkatId = data.tingkatId;

			// If tingkat name is provided instead of ID, look it up
			if (!tingkatId && data.tingkat) {
				const tingkatRepository =
					this.kelasRepository.manager.getRepository("Tingkat");
				const tingkat = await tingkatRepository.findOne({
					where: { nama: data.tingkat },
				});
				if (tingkat) {
					tingkatId = tingkat.id;
				}
			}

			const kelas = this.kelasRepository.create({
				nama: data.nama,
				tingkatId: tingkatId,
				tingkat: data.tingkat, // Keep for backward compatibility
				kapasitas: data.kapasitas || 30,
			});

			if (data.guruWaliId) {
				const guru = await this.guruRepository.findOne({
					where: { id: data.guruWaliId },
				});
				if (guru) {
					kelas.guruWali = guru;
					kelas.guruWaliId = guru.id;
				}
			}

			await this.kelasRepository.save(kelas);

			return {
				success: true,
				message: "Kelas berhasil dibuat",
				data: kelas,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
			};
		}
	}

	// Update class
	async updateKelas(id: number, data: any) {
		try {
			const kelas = await this.kelasRepository.findOne({
				where: { id },
				relations: ["guruMapel", "mataPelajaran"],
			});

			if (!kelas) {
				return { success: false, message: "Kelas tidak ditemukan" };
			}

			if (data.nama) kelas.nama = data.nama;

			// Handle tingkat - accept either tingkatId or tingkat (name)
			if (data.tingkatId) {
				kelas.tingkatId = data.tingkatId;
			} else if (data.tingkat) {
				// Look up tingkatId from tingkat name
				const tingkatRepository =
					this.kelasRepository.manager.getRepository("Tingkat");
				const tingkat = await tingkatRepository.findOne({
					where: { nama: data.tingkat },
				});
				if (tingkat) {
					kelas.tingkatId = tingkat.id;
					kelas.tingkat = data.tingkat; // Keep for backward compatibility
				}
			}

			if (data.kapasitas) kelas.kapasitas = data.kapasitas;

			// Handle guruWaliId - accept both guruWaliId and waliKelasId
			if (data.hasOwnProperty("guruWaliId")) {
				if (data.guruWaliId) {
					const guru = await this.guruRepository.findOne({
						where: { id: data.guruWaliId },
						relations: ["mataPelajaran"],
					});
					if (guru) {
						// If guru was already a subject teacher, remove them from guruMapel
						if (kelas.guruMapel && kelas.guruMapel.length > 0) {
							kelas.guruMapel = kelas.guruMapel.filter((g) => g.id !== guru.id);
						}

						// Remove this kelas from guru's kelasMapel array
						if (guru.kelasMapel) {
							guru.kelasMapel = guru.kelasMapel.filter(
								(k) => k !== kelas.id.toString(),
							);
							await this.guruRepository.save(guru);
						}

						kelas.guruWali = guru;
						kelas.guruWaliId = guru.id;

						// SYNC: Add guru's mataPelajaran to kelas.mataPelajaran
						if (guru.mataPelajaran && guru.mataPelajaran.id) {
							if (!kelas.mataPelajaran) {
								kelas.mataPelajaran = [];
							}

							// Add guru's mataPelajaran to kelas if not already present
							const already = kelas.mataPelajaran.find(
								(m) => m.id === guru.mataPelajaran.id,
							);
							if (!already) {
								kelas.mataPelajaran.push(guru.mataPelajaran);
							}
						}
					}
				} else {
					// Remove wali kelas if guruWaliId is null or undefined
					kelas.guruWali = null;
					kelas.guruWaliId = null;
				}
			} else if (data.hasOwnProperty("waliKelasId")) {
				// Alternative field name
				if (data.waliKelasId) {
					const guru = await this.guruRepository.findOne({
						where: { id: data.waliKelasId },
						relations: ["mataPelajaran"],
					});
					if (guru) {
						// If guru was already a subject teacher, remove them from guruMapel
						if (kelas.guruMapel && kelas.guruMapel.length > 0) {
							kelas.guruMapel = kelas.guruMapel.filter((g) => g.id !== guru.id);
						}

						// Remove this kelas from guru's kelasMapel array
						if (guru.kelasMapel) {
							guru.kelasMapel = guru.kelasMapel.filter(
								(k) => k !== kelas.id.toString(),
							);
							await this.guruRepository.save(guru);
						}

						kelas.guruWali = guru;
						kelas.guruWaliId = guru.id;

						// SYNC: Add guru's mataPelajaran to kelas.mataPelajaran
						if (guru.mataPelajaran && guru.mataPelajaran.id) {
							if (!kelas.mataPelajaran) {
								kelas.mataPelajaran = [];
							}

							// Add guru's mataPelajaran to kelas if not already present
							const already = kelas.mataPelajaran.find(
								(m) => m.id === guru.mataPelajaran.id,
							);
							if (!already) {
								kelas.mataPelajaran.push(guru.mataPelajaran);
							}
						}
					}
				} else {
					kelas.guruWali = null;
					kelas.guruWaliId = null;
				}
			}

			await this.kelasRepository.save(kelas);

			return {
				success: true,
				message: "Kelas berhasil diperbarui",
				data: kelas,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
			};
		}
	}

	// Delete class
	async deleteKelas(id: number) {
		try {
			const kelas = await this.kelasRepository.findOne({
				where: { id },
				relations: ["siswa", "guruMapel"],
			});

			if (!kelas) {
				return { success: false, message: "Kelas tidak ditemukan" };
			}

			// Remove all siswa from this kelas (set kelasId to null)
			if (kelas.siswa && kelas.siswa.length > 0) {
				for (const siswa of kelas.siswa) {
					siswa.kelasId = null;
				}
				await this.pesertaDidikRepository.save(kelas.siswa);
			}

			// Clear guruMapel relationships via junction table
			if (kelas.guruMapel && kelas.guruMapel.length > 0) {
				// TypeORM will automatically handle junction table cleanup
				kelas.guruMapel = [];
			}

			await this.kelasRepository.delete(id);

			return {
				success: true,
				message: "Kelas berhasil dihapus",
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
			};
		}
	}

	// Assign student to class
	async assignSiswaToKelas(kelasId: number, siswaId: number) {
		try {
			const kelas = await this.kelasRepository.findOne({
				where: { id: kelasId },
				relations: ["siswa"],
			});
			const siswa = await this.pesertaDidikRepository.findOne({
				where: { id: siswaId },
			});

			if (!kelas || !siswa) {
				return { success: false, message: "Kelas atau Siswa tidak ditemukan" };
			}

			siswa.kelasId = kelasId;
			await this.pesertaDidikRepository.save(siswa);

			return {
				success: true,
				message: "Siswa berhasil ditambahkan ke kelas",
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
			};
		}
	}

	// Add subject teacher to class
	async addGuruMapelToKelas(kelasId: number, guruId: number) {
		try {
			const kelas = await this.kelasRepository.findOne({
				where: { id: kelasId },
				relations: ["guruMapel", "mataPelajaran"],
			});
			const guru = await this.guruRepository.findOne({
				where: { id: guruId },
				relations: ["mataPelajaran"],
			});

			if (!kelas || !guru) {
				return { success: false, message: "Kelas atau Guru tidak ditemukan" };
			}

			// PREVENT: Wali kelas tidak bisa jadi guru mapel
			if (kelas.guruWaliId === guruId) {
				return {
					success: false,
					message: "Guru wali kelas tidak bisa dijadikan guru mapel",
				};
			}

			// Check if guru already added
			if (kelas.guruMapel.find((g) => g.id === guruId)) {
				return {
					success: false,
					message: "Guru sudah ditambahkan ke kelas ini",
				};
			}

			// PREVENT: Check if another guru already teaches the same mataPelajaran
			if (guru.mataPelajaran && guru.mataPelajaran.id) {
				// Check if wali teaches this material
				if (kelas.guruWaliId) {
					const waliGuru = await this.guruRepository.findOne({
						where: { id: kelas.guruWaliId },
					});
					if (waliGuru?.mataPelajaranId === guru.mataPelajaran.id) {
						return {
							success: false,
							message: `Wali kelas sudah mengajar ${guru.mataPelajaran.nama}. Tidak bisa menambah guru lain untuk mapel yang sama.`,
						};
					}
				}

				// Check if any other guru in guruMapel teaches this material
				const duplicateGuruMapel = kelas.guruMapel?.find(
					(g) => g.mataPelajaranId === guru.mataPelajaran.id,
				);
				if (duplicateGuruMapel) {
					return {
						success: false,
						message: `${duplicateGuruMapel.namaLengkap} sudah mengajar ${guru.mataPelajaran.nama}. Tidak bisa menambah guru lain untuk mapel yang sama.`,
					};
				}
			}

			kelas.guruMapel.push(guru);
			await this.kelasRepository.save(kelas);

			// SYNC: Add guru's mataPelajaran to kelas.mataPelajaran
			if (guru.mataPelajaran && guru.mataPelajaran.id) {
				if (!kelas.mataPelajaran) {
					kelas.mataPelajaran = [];
				}

				// Add guru's mataPelajaran to kelas if not already present
				const already = kelas.mataPelajaran.find(
					(m) => m.id === guru.mataPelajaran.id,
				);
				if (!already) {
					kelas.mataPelajaran.push(guru.mataPelajaran);
				}

				await this.kelasRepository.save(kelas);
			}

			// Update guru.kelasMapel to include this kelas
			if (!guru.kelasMapel) {
				guru.kelasMapel = [];
			}
			if (!guru.kelasMapel.includes(kelasId.toString())) {
				guru.kelasMapel.push(kelasId.toString());
				await this.guruRepository.save(guru);
			}

			return {
				success: true,
				message: "Guru mapel berhasil ditambahkan ke kelas",
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
			};
		}
	}

	// Remove subject teacher from class
	async removeGuruMapelFromKelas(kelasId: number, guruId: number) {
		try {
			console.log(`\n=== START: removeGuruMapelFromKelas ===`);
			console.log(`Removing Guru ID: ${guruId} from Kelas ID: ${kelasId}`);

			// STEP 1: Load kelas with all relations
			console.log(
				`\nSTEP 1: Loading kelas with guruMapel and mataPelajaran...`,
			);
			const kelas = await this.kelasRepository.findOne({
				where: { id: kelasId },
				relations: ["guruMapel", "guruMapel.mataPelajaran", "mataPelajaran"],
			});
			console.log(`Kelas loaded: ${kelas?.nama}`);
			console.log(`  - guruWaliId: ${kelas?.guruWaliId}`);
			console.log(`  - guruMapel count: ${kelas?.guruMapel?.length || 0}`);
			console.log(
				`  - guruMapel IDs: ${kelas?.guruMapel?.map((g) => g.id).join(", ")}`,
			);
			console.log(
				`  - mataPelajaran count: ${kelas?.mataPelajaran?.length || 0}`,
			);
			console.log(
				`  - mataPelajaran IDs: ${kelas?.mataPelajaran
					?.map((m) => `${m.id}(${m.nama})`)
					.join(", ")}`,
			);

			// STEP 2: Load guru to be removed
			console.log(`\nSTEP 2: Loading guru to be removed...`);
			const guru = await this.guruRepository.findOne({
				where: { id: guruId },
				relations: ["mataPelajaran"],
			});
			console.log(`Guru loaded: ${guru?.namaLengkap} (ID: ${guru?.id})`);
			console.log(`  - mataPelajaranId: ${guru?.mataPelajaranId}`);
			console.log(`  - mataPelajaran: ${guru?.mataPelajaran?.nama}`);

			// STEP 3: Validation
			console.log(`\nSTEP 3: Validation...`);
			if (!kelas) {
				throw new Error("Kelas tidak ditemukan");
			}
			if (!guru) {
				throw new Error("Guru tidak ditemukan");
			}
			if (kelas.guruWaliId === guruId) {
				throw new Error(
					"Tidak dapat menghapus wali kelas dari guru mapel. Ubah wali kelas terlebih dahulu.",
				);
			}
			console.log(`Validation passed ✓`);

			const guruMataPelajaranId = guru?.mataPelajaran?.id;
			console.log(`Guru's mapel ID: ${guruMataPelajaranId}`);

			// STEP 4: Delete from junction table
			console.log(`\nSTEP 4: Deleting from kelas_guru_mapel junction table...`);
			const deleteResult = await this.kelasRepository.query(
				"DELETE FROM kelas_guru_mapel WHERE kelasId = ? AND guruId = ?",
				[kelasId, guruId],
			);
			console.log(
				`Junction table deletion result: ${JSON.stringify(deleteResult)}`,
			);

			// STEP 4b: RELOAD kelas from DB to refresh relations after junction table delete
			console.log(`\nSTEP 4b: Reloading kelas from DB to refresh relations...`);
			const kelasRefreshed = await this.kelasRepository.findOne({
				where: { id: kelasId },
				relations: ["guruMapel", "guruMapel.mataPelajaran", "mataPelajaran"],
			});
			console.log(`Kelas reloaded with fresh relations`);
			console.log(
				`  - guruMapel count: ${kelasRefreshed?.guruMapel?.length || 0}`,
			);
			console.log(
				`  - guruMapel IDs: ${kelasRefreshed?.guruMapel
					?.map((g) => g.id)
					.join(", ")}`,
			);

			// Use refreshed kelas from here on
			Object.assign(kelas, kelasRefreshed);

			// STEP 5: Update guruMapel array (should now be correct after reload)
			console.log(`\nSTEP 5: Verifying guruMapel array after reload...`);
			const beforeCount = kelas.guruMapel?.length || 0;
			console.log(`  - Count: ${beforeCount}`);
			console.log(
				`  - IDs: ${kelas.guruMapel
					?.map((g) => `${g.id}(${g.namaLengkap})`)
					.join(", ")}`,
			);

			// STEP 6: Check if mapel should be removed
			console.log(`\nSTEP 6: Checking if mataPelajaran should be removed...`);
			console.log(`  - guruMataPelajaranId: ${guruMataPelajaranId}`);
			console.log(`  - kelas.mataPelajaran exists: ${!!kelas.mataPelajaran}`);
			console.log(
				`  - kelas.mataPelajaran count: ${kelas.mataPelajaran?.length || 0}`,
			);

			if (
				guruMataPelajaranId &&
				kelas.mataPelajaran &&
				kelas.mataPelajaran.length > 0
			) {
				// Check if wali teaches this material
				console.log(`\n  SUBSTEP 6a: Checking wali kelas...`);
				let waliTeachesSame = false;
				if (kelas.guruWaliId) {
					const waliGuru = await this.guruRepository.findOne({
						where: { id: kelas.guruWaliId },
						relations: ["mataPelajaran"],
					});
					console.log(`    - Wali found: ${waliGuru?.namaLengkap}`);
					console.log(
						`    - Wali mataPelajaranId: ${waliGuru?.mataPelajaranId}`,
					);
					waliTeachesSame = waliGuru?.mataPelajaranId === guruMataPelajaranId;
					console.log(`    - Wali teaches same material: ${waliTeachesSame}`);
				} else {
					console.log(`    - No wali kelas assigned`);
				}

				// Check if any other guru in guruMapel teaches this material
				console.log(`\n  SUBSTEP 6b: Checking other guruMapel...`);
				console.log(
					`    - Checking ${kelas.guruMapel?.length || 0} remaining guruMapel`,
				);
				kelas.guruMapel?.forEach((g, idx) => {
					const teachesIt = g.mataPelajaran?.id === guruMataPelajaranId;
					console.log(
						`    - Guru[${idx}]: ${g.namaLengkap} (ID: ${g.id}), mataPelajaran: ${g.mataPelajaran?.nama} (ID: ${g.mataPelajaran?.id}), teaches same: ${teachesIt}`,
					);
				});

				const otherGuruTeachesSame = kelas.guruMapel?.some(
					(g) => g.mataPelajaran?.id === guruMataPelajaranId,
				);
				console.log(
					`    - Other guru teaches same material: ${otherGuruTeachesSame}`,
				);

				// If neither wali nor other guru teaches this material, remove it
				console.log(`\n  SUBSTEP 6c: Decision...`);
				console.log(`    - waliTeachesSame: ${waliTeachesSame}`);
				console.log(`    - otherGuruTeachesSame: ${otherGuruTeachesSame}`);

				if (!waliTeachesSame && !otherGuruTeachesSame) {
					console.log(
						`    - ACTION: Removing orphan mataPelajaran ID ${guruMataPelajaranId}`,
					);
					const beforeMapelCount = kelas.mataPelajaran.length;
					kelas.mataPelajaran = kelas.mataPelajaran.filter(
						(m) => m.id !== guruMataPelajaranId,
					);
					const afterMapelCount = kelas.mataPelajaran.length;
					console.log(
						`    - MataPelajaran count: ${beforeMapelCount} -> ${afterMapelCount}`,
					);
					await this.kelasRepository.save(kelas);
					console.log(`    - Kelas saved with updated mataPelajaran ✓`);
				} else {
					console.log(
						`    - ACTION: Keep mataPelajaran (another guru or wali teaches it)`,
					);
				}
			} else {
				console.log(`  - Skipped: no mataPelajaran to check`);
			}

			console.log(`\n=== END: removeGuruMapelFromKelas - SUCCESS ===\n`);

			return {
				success: true,
				message: "Guru berhasil dihapus dari kelas",
			};
		} catch (error) {
			console.error(`\n=== ERROR in removeGuruMapelFromKelas ===`);
			console.error(error);
			console.log(`=== END: removeGuruMapelFromKelas - FAILED ===\n`);
			return {
				success: false,
				message: error.message,
			};
		}
	}

	// Get all kelas for dropdown (simple list without pagination)
	async getAllKelasForDropdown() {
		try {
			const kelas = await this.kelasRepository.find({
				relations: ["tingkatRef", "mataPelajaran"],
				order: { nama: "ASC" },
			});

			return {
				success: true,
				data: kelas,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				data: [],
			};
		}
	}

	// Get kelas without wali kelas (for dropdown when assigning wali)
	async getKelasWithoutWali() {
		try {
			const kelas = await this.kelasRepository.find({
				where: { guruWaliId: null },
				relations: ["tingkatRef"],
				order: { nama: "ASC" },
			});

			return {
				success: true,
				data: kelas,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				data: [],
			};
		}
	}

	// Remove wali kelas
	async removeWaliKelas(kelasId: number) {
		try {
			console.log(`\n=== START: removeWaliKelas ===`);
			console.log(`Removing wali kelas from Kelas ID: ${kelasId}`);

			// STEP 1: Load kelas with all relations
			console.log(
				`\nSTEP 1: Loading kelas with guruMapel and mataPelajaran...`,
			);
			const kelas = await this.kelasRepository.findOne({
				where: { id: kelasId },
				relations: ["mataPelajaran", "guruMapel", "guruMapel.mataPelajaran"],
			});

			if (!kelas) {
				console.log(`ERROR: Kelas not found`);
				return { success: false, message: "Kelas tidak ditemukan" };
			}

			console.log(`Kelas loaded: ${kelas.nama}`);
			console.log(`  - guruWaliId: ${kelas.guruWaliId}`);
			console.log(`  - guruMapel count: ${kelas.guruMapel?.length || 0}`);
			console.log(
				`  - guruMapel IDs: ${kelas.guruMapel?.map((g) => g.id).join(", ")}`,
			);
			console.log(
				`  - mataPelajaran count: ${kelas.mataPelajaran?.length || 0}`,
			);
			console.log(
				`  - mataPelajaran: ${kelas.mataPelajaran
					?.map((m) => `${m.id}(${m.nama})`)
					.join(", ")}`,
			);

			const waliId = kelas.guruWaliId;
			console.log(`\nSTEP 2: Wali ID to remove: ${waliId}`);

			// Get wali guru's mataPelajaran before removing
			console.log(`\nSTEP 3: Getting wali guru's mataPelajaran...`);
			let waliMataPelajaranId: number | null = null;
			if (waliId) {
				const waliGuru = await this.guruRepository.findOne({
					where: { id: waliId },
					relations: ["mataPelajaran"],
				});
				console.log(`Wali guru found: ${waliGuru?.namaLengkap}`);
				console.log(`  - mataPelajaranId: ${waliGuru?.mataPelajaranId}`);
				console.log(`  - mataPelajaran: ${waliGuru?.mataPelajaran?.nama}`);
				waliMataPelajaranId = waliGuru?.mataPelajaran?.id || null;
			} else {
				console.log(`No wali kelas assigned`);
			}

			// STEP 4: Remove wali ID from kelas
			console.log(`\nSTEP 4: Setting guruWaliId to null...`);
			kelas.guruWaliId = null;
			console.log(`guruWaliId set to null ✓`);

			// STEP 5: Remove wali from guruMapel if present
			console.log(`\nSTEP 5: Removing wali from guruMapel if present...`);
			if (waliId && kelas.guruMapel && kelas.guruMapel.length > 0) {
				console.log(`Wali was in guruMapel, removing from junction table...`);
				// Remove from M:M junction table FIRST
				const deleteResult = await this.kelasRepository.query(
					"DELETE FROM kelas_guru_mapel WHERE kelasId = ? AND guruId = ?",
					[kelasId, waliId],
				);
				console.log(
					`Junction table deletion result: ${JSON.stringify(deleteResult)}`,
				);

				// RELOAD kelas from DB to refresh relations after junction table delete
				console.log(
					`\nSTEP 5b: Reloading kelas from DB to refresh relations...`,
				);
				const kelasRefreshed = await this.kelasRepository.findOne({
					where: { id: kelasId },
					relations: ["mataPelajaran", "guruMapel", "guruMapel.mataPelajaran"],
				});
				Object.assign(kelas, kelasRefreshed);
				console.log(`Kelas reloaded with fresh relations`);
				console.log(`  - guruMapel count: ${kelas.guruMapel?.length || 0}`);
				console.log(
					`  - guruMapel IDs: ${kelas.guruMapel?.map((g) => g.id).join(", ")}`,
				);
			} else {
				console.log(`Wali was not in guruMapel, skipping`);
			}

			// STEP 6: Save kelas
			console.log(`\nSTEP 6: Saving kelas...`);
			await this.kelasRepository.save(kelas);
			console.log(`Kelas saved ✓`);

			// STEP 7: Check if wali's mataPelajaran should be removed
			console.log(`\nSTEP 7: Checking if mataPelajaran should be removed...`);
			console.log(`  - waliMataPelajaranId: ${waliMataPelajaranId}`);
			console.log(
				`  - kelas.mataPelajaran count: ${kelas.mataPelajaran?.length || 0}`,
			);

			if (
				waliMataPelajaranId &&
				kelas.mataPelajaran &&
				kelas.mataPelajaran.length > 0
			) {
				console.log(
					`\n  Checking if other guru teaches the same mataPelajaran...`,
				);
				console.log(
					`  Checking ${kelas.guruMapel?.length || 0} remaining guruMapel`,
				);

				kelas.guruMapel?.forEach((g, idx) => {
					const teachesIt = g.mataPelajaran?.id === waliMataPelajaranId;
					console.log(
						`    - Guru[${idx}]: ${g.namaLengkap} (ID: ${g.id}), mataPelajaran: ${g.mataPelajaran?.nama} (ID: ${g.mataPelajaran?.id}), teaches same: ${teachesIt}`,
					);
				});

				const otherGuruTeachesSame = kelas.guruMapel?.some(
					(g) => g.mataPelajaran?.id === waliMataPelajaranId,
				);
				console.log(
					`  - Other guru teaches same material: ${otherGuruTeachesSame}`,
				);

				// If no other guru teaches this material, remove it from kelas
				if (!otherGuruTeachesSame) {
					console.log(
						`  - ACTION: Removing orphan mataPelajaran ID ${waliMataPelajaranId}`,
					);
					const beforeCount = kelas.mataPelajaran.length;
					kelas.mataPelajaran = kelas.mataPelajaran.filter(
						(m) => m.id !== waliMataPelajaranId,
					);
					const afterCount = kelas.mataPelajaran.length;
					console.log(
						`  - MataPelajaran count: ${beforeCount} -> ${afterCount}`,
					);
					await this.kelasRepository.save(kelas);
					console.log(`  - Kelas saved with updated mataPelajaran ✓`);
				} else {
					console.log(
						`  - ACTION: Keep mataPelajaran (another guru teaches it)`,
					);
				}
			} else {
				console.log(`  - Skipped: no mataPelajaran to check`);
			}

			console.log(`\n=== END: removeWaliKelas - SUCCESS ===\n`);

			return {
				success: true,
				message: "Wali kelas berhasil dihapus",
				data: kelas,
			};
		} catch (error) {
			console.error(`\n=== ERROR in removeWaliKelas ===`);
			console.error(error);
			console.log(`=== END: removeWaliKelas - FAILED ===\n`);
			return {
				success: false,
				message: error.message,
			};
		}
	}
}
