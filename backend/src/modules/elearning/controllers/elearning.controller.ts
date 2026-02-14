import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
	Request,
	Res,
	HttpCode,
	HttpStatus,
	BadRequestException,
	UseInterceptors,
	UploadedFile,
	ParseIntPipe,
} from "@nestjs/common";
import { Response } from "express";
import { createReadStream } from "fs";
import { join } from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { RolesGuard } from "@/common/guards/roles.guard";
import { MateriService } from "../services/materi.service";
import { TugasService } from "../services/tugas.service";
import { JawabanTugasService } from "../services/jawaban-tugas.service";
import { NilaiTugasService } from "../services/nilai-tugas.service";
import { NotifikasiService } from "../services/notifikasi.service";
import { GuruMapelService } from "../services/guru-mapel.service";
import { CreateRencanaDto, UpdateRencanaDto } from "../dtos/rencana.dto";
import { CreateKontenDto, UpdateKontenDto } from "../dtos/konten.dto";
import { RencanaService } from "../services/rencana.service";
import { KontenService } from "../services/konten.service";
import { ElearningService } from "../services/elearning.service";
import { MateriStatus } from "../entities/materi.entity";
import { TugasStatus } from "../entities/tugas.entity";
import { CreateMateriDto, UpdateMateriDto } from "../dtos/materi.dto";
import { CreateTugasDto, UpdateTugasDto } from "../dtos/tugas.dto";
import {
	CreateJawabanTugasDto,
	UpdateJawabanTugasDto,
} from "../dtos/jawaban-tugas.dto";
import { CreateNilaiTugasDto } from "../dtos/nilai-tugas.dto";
import { CreateGuruMapelDto } from "../dtos/guru-mapel.dto";
import { CreateSoalEsaiDto } from "../dtos/create-soal-esai.dto";
import {
	UpdateSoalEsaiDto,
	SubmitJawabanEsaiDto,
} from "../dtos/update-soal-esai.dto";
import { PaginationQueryDto } from "../dtos/pagination.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { MataPelajaran } from "../entities/mata-pelajaran.entity";
import { Guru } from "../../guru/entities/guru.entity";
import { FileUploadService } from "../services/file-upload.service";
import { DocumentConverterService } from "@/common/services/document-converter.service";

@Controller("elearning")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElearningController {
	constructor(
		private readonly materiService: MateriService,
		private readonly tugasService: TugasService,
		private readonly jawabanService: JawabanTugasService,
		private readonly nilaiService: NilaiTugasService,
		private readonly notifikasiService: NotifikasiService,
		private readonly guruMapelService: GuruMapelService,
		private readonly rencanaService: RencanaService,
		private readonly kontenService: KontenService,
		private readonly elearningService: ElearningService,
		private readonly fileUploadService: FileUploadService,
		private readonly documentConverterService: DocumentConverterService,
		@InjectRepository(MataPelajaran)
		private readonly mataPelajaranRepo: Repository<MataPelajaran>,
		@InjectRepository(Guru)
		private readonly guruRepo: Repository<Guru>,
	) {}

	// ============= HELPER METHODS =============

	/**
	 * Get guru ID from request user
	 * First tries req.user.guruId, then queries guru table by userId
	 * This handles both cases: when User.guruId is set and when it's null
	 */
	private async getGuruId(req: any): Promise<number | null> {
		if (req.user.guruId) {
			return req.user.guruId;
		}

		// Fallback: query guru by userId if guruId not in JWT
		const guru = await this.guruRepo.findOne({
			where: { userId: req.user.id },
		});

		return guru?.id || null;
	}

	// ============= GURU MATERI ENDPOINTS =============

	@Post("materi")
	@Roles("guru")
	async createMateri(@Request() req, @Body() dto: CreateMateriDto) {
		// Fetch guru by userId
		const guru = await this.guruRepo.findOne({
			where: { userId: req.user.id },
		});

		if (!guru) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.materiService.create(guru.id, dto);
	}

	@Get("guru/materi")
	@Roles("guru")
	async getAllMateriByGuru(
		@Request() req,
		@Query("status") status?: MateriStatus,
		@Query() pagination?: PaginationQueryDto,
	) {
		const guru = await this.guruRepo.findOne({
			where: { userId: req.user.id },
		});

		if (!guru) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.materiService.findByGuruId(guru.id, status, pagination);
	}

	@Get("guru/materi/:mapelId")
	@Roles("guru")
	getMateriByMapel(
		@Param("mapelId") mapelId: number,
		@Query("status") status?: MateriStatus,
		@Query() pagination?: PaginationQueryDto,
	) {
		return this.materiService.findAll(mapelId, status, pagination);
	}

	@Get("materi/:id")
	@Roles("guru", "siswa", "admin")
	getMateriDetail(@Param("id") id: number) {
		return this.materiService.findById(id);
	}

	@Put("materi/:id")
	@Roles("guru", "admin")
	async updateMateri(
		@Request() req,
		@Param("id") id: number,
		@Body() dto: UpdateMateriDto,
	) {
		// Admin can update any materi, guru can only update their own
		if (req.user.role === "admin") {
			return this.materiService.updateAdmin(id, dto);
		}
		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}
		return this.materiService.update(id, guruId, dto);
	}

	@Post("materi/:id/publish")
	@Roles("guru")
	async publishMateri(@Request() req, @Param("id") id: number) {
		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}
		return this.materiService.publishMateri(id, guruId);
	}

	@Post("materi/:id/close")
	@Roles("guru")
	async closeMateri(@Request() req, @Param("id") id: number) {
		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}
		return this.materiService.closeMateri(id, guruId);
	}

	@Delete("materi/:id")
	@Roles("guru", "admin")
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteMateri(@Request() req, @Param("id") id: number) {
		// Admin can delete any materi, guru can only delete their own
		if (req.user.role === "admin") {
			return this.materiService.deleteAdmin(id);
		}
		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}
		return this.materiService.delete(id, guruId);
	}

	// ============= RENCANA PEMBELAJARAN ENDPOINTS =============

	@Get("materi/:materiId/rencana")
	@Roles("guru", "siswa", "admin")
	getRencanaByMateri(@Param("materiId") materiId: number) {
		return this.rencanaService.findByMateriId(materiId);
	}

	@Post("materi/:materiId/rencana")
	@Roles("guru", "admin")
	createRencana(
		@Param("materiId") materiId: number,
		@Body() dto: CreateRencanaDto,
	) {
		return this.rencanaService.create(materiId, dto);
	}

	@Put("rencana/:id")
	@Roles("guru", "admin")
	updateRencana(@Param("id") id: number, @Body() dto: UpdateRencanaDto) {
		return this.rencanaService.update(id, dto);
	}

	@Delete("rencana/:id")
	@Roles("guru", "admin")
	@HttpCode(HttpStatus.NO_CONTENT)
	deleteRencana(@Param("id") id: number) {
		return this.rencanaService.delete(id);
	}

	// ============= KONTEN MATERI ENDPOINTS =============

	@Get("materi/:materiId/konten")
	@Roles("guru", "siswa", "admin")
	getKontenByMateri(@Param("materiId") materiId: number) {
		return this.kontenService.findByMateriId(materiId);
	}

	@Post("materi/:materiId/konten")
	@Roles("guru", "admin")
	createKonten(
		@Param("materiId") materiId: number,
		@Body() dto: CreateKontenDto,
	) {
		return this.kontenService.create(materiId, dto);
	}

	@Put("konten/:id")
	@Roles("guru", "admin")
	updateKonten(@Param("id") id: number, @Body() dto: UpdateKontenDto) {
		return this.kontenService.update(id, dto);
	}

	@Delete("konten/:id")
	@Roles("guru", "admin")
	@HttpCode(HttpStatus.NO_CONTENT)
	deleteKonten(@Param("id") id: number) {
		return this.kontenService.delete(id);
	}

	// ============= GURU TUGAS ENDPOINTS =============

	@Post("tugas")
	@Roles("guru", "admin")
	async createTugas(@Request() req, @Body() dto: CreateTugasDto) {
		// For guru, fetch guru ID from userId
		if (req.user.role === "guru") {
			const guru = await this.guruRepo.findOne({
				where: { userId: req.user.id },
			});

			if (!guru) {
				throw new BadRequestException("Guru profile tidak ditemukan");
			}

			return this.tugasService.create(guru.id, dto);
		}

		// For admin, use admin ID or as-is
		return this.tugasService.create(req.user.id, dto);
	}

	@Get("guru/tugas")
	@Roles("guru")
	async getAllTugasByGuru(
		@Request() req,
		@Query("status") status?: TugasStatus,
		@Query() pagination?: PaginationQueryDto,
	) {
		const guru = await this.guruRepo.findOne({
			where: { userId: req.user.id },
		});

		if (!guru) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.tugasService.findByGuruId(guru.id, status, pagination);
	}

	@Post("materi/:materiId/tugas")
	@Roles("admin")
	createTugasAdmin(
		@Param("materiId") materiId: number,
		@Body() dto: CreateTugasDto,
	) {
		return this.tugasService.createForMateri(materiId, dto);
	}

	@Get("guru/tugas/:materiId")
	@Roles("guru")
	getTugasByMateri(
		@Param("materiId") materiId: number,
		@Query("status") status?: TugasStatus,
		@Query() pagination?: PaginationQueryDto,
	) {
		return this.tugasService.findAll(materiId, status, pagination);
	}

	@Get("materi/:materiId/tugas")
	@Roles("guru", "siswa", "admin")
	getTugasByMateriAll(
		@Param("materiId") materiId: number,
		@Query("status") status?: TugasStatus,
		@Query() pagination?: PaginationQueryDto,
	) {
		return this.tugasService.findAll(materiId, status, pagination);
	}

	@Get("tugas/:id")
	@Roles("guru", "siswa", "admin")
	getTugasDetail(@Param("id") id: number) {
		return this.tugasService.findById(id);
	}

	@Put("tugas/:id")
	@Roles("guru", "admin")
	async updateTugas(
		@Request() req,
		@Param("id") id: number,
		@Body() dto: UpdateTugasDto,
	) {
		// Admin can update any tugas, guru can only update their own
		if (req.user.role === "admin") {
			return this.tugasService.updateAdmin(id, dto);
		}

		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.tugasService.update(id, guruId, dto);
	}

	@Post("tugas/:id/publish")
	@Roles("guru", "admin")
	async publishTugas(@Request() req, @Param("id") id: number) {
		// Admin can publish any tugas
		if (req.user.role === "admin") {
			return this.tugasService.publishTugasAdmin(id);
		}

		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.tugasService.publishTugas(id, guruId);
	}

	@Post("tugas/:id/upload")
	@Roles("guru", "admin")
	@UseInterceptors(FileInterceptor("file"))
	async uploadTugasFile(
		@Request() req,
		@Param("id") id: number,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		try {
			console.log(
				`[FILE UPLOAD] User: ${req.user.id}, Role: ${req.user.role}, Tugas ID: ${id}, File: ${file.originalname}`,
			);

			// Use FileUploadService for consistent file handling
			const result = await this.fileUploadService.uploadMateriFile(
				file,
				"tugas",
			);

			// Admin can upload for any tugas, guru only for their own
			if (req.user.role === "admin") {
				console.log(`[FILE UPLOAD] Admin uploading for tugas ${id}`);
				await this.tugasService.updateFileAdmin(id, result);
			} else {
				console.log(
					`[FILE UPLOAD] Guru ${req.user.guruId} uploading for tugas ${id}`,
				);
				await this.tugasService.updateFile(id, req.user.guruId, result);
			}

			return {
				success: true,
				message: "File berhasil diupload",
				data: result,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new BadRequestException(`Gagal upload file: ${message}`);
		}
	}

	@Get("tugas/:id/download")
	@Roles("guru", "admin", "peserta-didik")
	async downloadTugasFile(@Param("id") id: number, @Res() res: Response) {
		try {
			const tugas = await this.tugasService.findById(id);
			if (!tugas || !tugas.filePath) {
				return res.status(404).json({ message: "File tidak ditemukan" });
			}

			const filePath = join(process.cwd(), tugas.filePath);
			const stream = createReadStream(filePath);
			res.setHeader(
				"Content-Type",
				tugas.fileType || "application/octet-stream",
			);
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${tugas.fileName}"`,
			);
			stream.pipe(res);
		} catch (error) {
			return res.status(500).json({ message: "Gagal mengunduh file" });
		}
	}

	@Post("tugas/:id/close")
	@Roles("guru", "admin")
	async closeTugas(@Request() req, @Param("id") id: number) {
		// Admin can close any tugas
		if (req.user.role === "admin") {
			return this.tugasService.closeTugasAdmin(id);
		}

		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.tugasService.closeTugas(id, guruId);
	}

	@Delete("tugas/:id")
	@Roles("guru", "admin")
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteTugas(@Request() req, @Param("id") id: number) {
		// Admin can delete any tugas
		if (req.user.role === "admin") {
			return this.tugasService.deleteAdmin(id);
		}

		const guruId = await this.getGuruId(req);
		if (!guruId) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.tugasService.delete(id, guruId);
	}

	// ============= GURU GRADING ENDPOINTS =============

	@Get("guru/jawaban")
	@Roles("guru")
	async getAllJawabanByGuru(@Request() req) {
		const guru = await this.guruRepo.findOne({
			where: { userId: req.user.id },
		});

		if (!guru) {
			throw new BadRequestException("Guru profile tidak ditemukan");
		}

		return this.jawabanService.getJawabanByGuruId(guru.id);
	}

	@Get("guru/tugas/:tugasId/jawaban")
	@Roles("guru")
	async getJawabanByTugas(@Param("tugasId") tugasId: number) {
		console.log(`\n[ENDPOINT] GET /guru/tugas/${tugasId}/jawaban`);
		try {
			const result = await this.jawabanService.getJawabanForGrading(tugasId);
			console.log(
				`[ENDPOINT] Returning ${result.length} submissions for tugasId ${tugasId}`,
			);
			return {
				success: true,
				data: result,
				total: result.length,
			};
		} catch (error) {
			console.error(`[ENDPOINT] Error getting jawaban by tugas:`, error);
			throw error;
		}
	}

	@Get("admin/tugas/:tugasId/jawaban")
	@Roles("admin")
	async getJawabanByTugasAdmin(@Param("tugasId") tugasId: number) {
		console.log(`\n[ENDPOINT] GET /admin/tugas/${tugasId}/jawaban`);
		try {
			const result = await this.jawabanService.getJawabanForGrading(tugasId);
			console.log(
				`[ENDPOINT] Returning ${result.length} submissions for tugasId ${tugasId}`,
			);
			return {
				success: true,
				data: result,
				total: result.length,
			};
		} catch (error) {
			console.error(`[ENDPOINT] Error getting jawaban by tugas:`, error);
			throw error;
		}
	}

	@Get("jawaban/:id")
	@Roles("siswa", "guru")
	getJawabanDetail(@Param("id") id: number) {
		return this.jawabanService.findById(id);
	}

	@Post("jawaban/:id/nilai")
	@Roles("guru")
	gradeJawaban(
		@Request() req,
		@Param("id") id: number,
		@Body() dto: CreateNilaiTugasDto,
	) {
		return this.nilaiService.create(req.user.id, {
			...dto,
			jawabanTugasId: id,
		});
	}

	@Put("jawaban/:id/nilai")
	@Roles("guru")
	updateGrade(
		@Request() req,
		@Param("id") id: number,
		@Body() dto: CreateNilaiTugasDto,
	) {
		return this.nilaiService.create(req.user.id, {
			...dto,
			jawabanTugasId: id,
		});
	}

	// ============= SISWA ENDPOINTS =============

	@Get("siswa/mapel")
	@Roles("siswa")
	getSiswaMapel(@Request() req) {
		return this.materiService.getMapelForSiswa(req.user.kelasId);
	}

	@Get("siswa/materi/:mapelId")
	@Roles("siswa")
	getSiswaMateri(@Param("mapelId") mapelId: number) {
		return this.materiService.getMateriForSiswa(mapelId);
	}

	@Get("siswa/tugas/:mapelId")
	@Roles("siswa")
	getSiswaAvailableTugas(@Param("mapelId") mapelId: number) {
		return this.tugasService.getAvailableTugasByMapel(mapelId);
	}

	@Get("siswa/tugas")
	@Roles("siswa")
	getAllSiswaAvailableTugas(@Request() req) {
		return this.tugasService.getAvailableTugasForSiswa(req.user.id);
	}

	@Get("published-materi")
	@Roles("siswa")
	getPublishedMateri(@Request() req) {
		return this.materiService.getPublishedMateriForSiswa(req.user.id);
	}

	@Get("siswa/stats")
	@Roles("siswa")
	getSiswaStats(@Request() req) {
		return this.nilaiService.getSiswaStats(req.user.id);
	}

	@Get("siswa/nilai")
	@Roles("siswa")
	getSiswaNilai(@Request() req) {
		return this.nilaiService.getNilaiBySiswa(req.user.id);
	}

	@Post("jawaban")
	@Roles("siswa")
	submitJawaban(@Request() req, @Body() dto: CreateJawabanTugasDto) {
		return this.jawabanService.create(req.user.id, dto);
	}

	@Put("jawaban/:id")
	@Roles("siswa")
	updateJawaban(
		@Request() req,
		@Param("id") id: number,
		@Body() dto: UpdateJawabanTugasDto,
	) {
		return this.jawabanService.update(id, req.user.id, dto);
	}

	@Post("jawaban/upload")
	@Roles("siswa")
	@UseInterceptors(FileInterceptor("file"))
	async uploadJawabanFile(
		@Request() req,
		@UploadedFile() file: Express.Multer.File,
		@Body() body: any,
	) {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		try {
			const tugasId = parseInt(body.tugasId);
			console.log(
				`[JAWABAN UPLOAD] User: ${req.user.id}, Tugas ID: ${tugasId}, File: ${file.originalname}`,
			);

			// Upload file
			const fileResult = await this.fileUploadService.uploadMateriFile(
				file,
				"tugas",
			);

			// Create jawaban record with file path
			const jawabanDto = {
				tugasId,
				filePath: fileResult.filePath,
				tipeFile: fileResult.fileType,
				fileName: fileResult.fileName,
			};

			const jawaban = await this.jawabanService.create(req.user.id, jawabanDto);

			// Automatically submit (mark as SUBMITTED) after file upload
			const submittedJawaban = await this.jawabanService.submit(
				jawaban.id,
				req.user.id,
			);

			return {
				success: true,
				message: "Jawaban berhasil diupload dan disubmit",
				data: submittedJawaban,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new BadRequestException(`Gagal upload jawaban: ${message}`);
		}
	}

	@Put("jawaban/:id/upload")
	@Roles("siswa")
	@UseInterceptors(FileInterceptor("file"))
	async updateJawabanFile(
		@Request() req,
		@Param("id", ParseIntPipe) id: number,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		try {
			console.log(
				`[JAWABAN UPDATE] User: ${req.user.id}, Jawaban ID: ${id}, File: ${file.originalname}`,
			);

			// Verify jawaban exists and belongs to student
			const jawaban = await this.jawabanService.findById(id);
			if (!jawaban) {
				throw new BadRequestException("Jawaban tidak ditemukan");
			}

			// Verify ownership
			if (jawaban.pesertaDidikId !== req.user.id) {
				throw new BadRequestException(
					"Anda tidak memiliki akses untuk mengubah jawaban ini",
				);
			}

			// Upload new file
			const fileResult = await this.fileUploadService.uploadMateriFile(
				file,
				"tugas",
			);

			// Update jawaban with new file using dedicated file update method
			const updatedJawaban = await this.jawabanService.updateFile(
				id,
				req.user.id,
				{
					filePath: fileResult.filePath,
					tipeFile: fileResult.fileType,
					fileName: fileResult.fileName,
				},
			);

			console.log(
				`[JAWABAN UPDATE] File updated, status before submit: ${updatedJawaban.statusSubmisi}`,
			);

			// Ensure jawaban is submitted after file update
			const submittedJawaban = await this.jawabanService.submit(
				id,
				req.user.id,
			);

			console.log(
				`[JAWABAN UPDATE] Final status after submit: ${submittedJawaban.statusSubmisi}`,
			);

			return {
				success: true,
				message: "File jawaban berhasil diperbarui dan disubmit",
				data: submittedJawaban,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new BadRequestException(`Gagal update file jawaban: ${message}`);
		}
	}

	@Get("jawaban/:id/download")
	@Roles("siswa", "guru", "admin")
	async downloadJawabanFile(
		@Param("id", ParseIntPipe) id: number,
		@Res() res: Response,
	) {
		try {
			const jawaban = await this.jawabanService.findById(id);
			if (!jawaban || !jawaban.filePath) {
				return res.status(404).json({ message: "File tidak ditemukan" });
			}

			const filePath = join(process.cwd(), jawaban.filePath);
			const stream = createReadStream(filePath);
			res.setHeader(
				"Content-Type",
				jawaban.tipeFile || "application/octet-stream",
			);
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${jawaban.fileName}"`,
			);
			stream.pipe(res);
		} catch (error) {
			return res.status(500).json({ message: "Gagal mengunduh file" });
		}
	}

	@Delete("jawaban/:id")
	@Roles("siswa", "guru", "admin")
	async deleteJawaban(@Request() req, @Param("id", ParseIntPipe) id: number) {
		const jawaban = await this.jawabanService.findById(id);

		// Only allow student to delete their own answer, or teacher/admin to delete any
		if (req.user.role === "siswa" && jawaban.pesertaDidikId !== req.user.id) {
			throw new BadRequestException(
				"Anda tidak memiliki akses untuk menghapus jawaban ini",
			);
		}

		await this.jawabanService.delete(id, jawaban.pesertaDidikId);
		return { success: true, message: "Jawaban berhasil dihapus" };
	}

	@Delete("jawaban-esai/:id")
	@Roles("siswa", "guru", "admin")
	async deleteJawabanEsai(
		@Request() req,
		@Param("id", ParseIntPipe) id: number,
	) {
		return this.elearningService.deleteJawabanEsai(
			id,
			req.user.id,
			req.user.role,
		);
	}

	@Get("siswa/:siswaId/materi/:materiId/jawaban-count")
	@Roles("siswa")
	async getJawabanCountByMateri(
		@Request() req,
		@Param("siswaId", ParseIntPipe) siswaId: number,
		@Param("materiId", ParseIntPipe) materiId: number,
	) {
		// Ensure student can only get their own count
		if (req.user.id !== siswaId) {
			throw new BadRequestException("Anda tidak memiliki akses ke data ini");
		}

		return await this.jawabanService.getJawabanCountByMateri(siswaId, materiId);
	}

	@Get("siswa/riwayat")
	@Roles("siswa")
	getSiswaHistory(@Request() req) {
		return this.jawabanService.getSiswaAnswers(req.user.id);
	}

	// ============= NOTIFICATION ENDPOINTS =============

	@Get("notifikasi")
	@Roles("siswa")
	getAllNotifications(@Request() req, @Query("limit") limit: number = 20) {
		return this.notifikasiService.getAllNotifications(req.user.id, limit);
	}

	@Get("notifikasi/unread")
	@Roles("siswa")
	getUnreadNotifications(@Request() req) {
		return this.notifikasiService.getUnreadNotifications(req.user.id);
	}

	@Get("notifikasi/count")
	@Roles("siswa")
	getUnreadCount(@Request() req) {
		return this.notifikasiService.getUnreadCount(req.user.id);
	}

	@Post("notifikasi/:id/read")
	@Roles("siswa")
	@HttpCode(HttpStatus.NO_CONTENT)
	markNotificationAsRead(@Param("id") id: number) {
		return this.notifikasiService.markAsRead(id);
	}

	@Post("notifikasi/read-all")
	@Roles("siswa")
	@HttpCode(HttpStatus.NO_CONTENT)
	markAllAsRead(@Request() req) {
		return this.notifikasiService.markAllAsRead(req.user.id);
	}

	// ============= ADMIN GURU-MAPEL ENDPOINTS =============

	@Post("admin/guru-mapel")
	@Roles("admin")
	assignGuruMapel(@Body() dto: CreateGuruMapelDto) {
		return this.guruMapelService.assign(dto);
	}

	@Get("admin/guru/:guruId/mapel")
	@Roles("admin")
	getGuruMapel(@Param("guruId") guruId: number) {
		return this.guruMapelService.getMapelByGuru(guruId);
	}

	@Delete("admin/guru-mapel/:id")
	@Roles("admin")
	@HttpCode(HttpStatus.NO_CONTENT)
	removeGuruMapel(@Param("id") id: number) {
		return this.guruMapelService.removeAssignment(id);
	}

	// ============= ADMIN MATERI ENDPOINTS =============

	@Get("admin/materi")
	@Roles("admin")
	getAllMateriAdmin(@Query() pagination?: PaginationQueryDto) {
		return this.materiService.findAllForAdmin(pagination);
	}

	@Post("admin/materi")
	@Roles("admin")
	createMateriAdmin(@Body() dto: CreateMateriDto, @Request() req) {
		// Admin can create materi without guruId or with specified guruId
		const guruId = dto.guruId || null;
		return this.materiService.create(guruId, dto);
	}

	// ============= DROPDOWN/LIST ENDPOINTS =============

	@Get("dropdown/mata-pelajaran")
	@Roles("guru", "siswa", "admin")
	async getMataPelajaranDropdown() {
		return await this.mataPelajaranRepo.find({
			select: ["id", "nama"],
			order: { nama: "ASC" },
		});
	}

	@Get("mata-pelajaran")
	@Roles("guru", "siswa", "admin")
	async getAllMataPelajaran() {
		return await this.mataPelajaranRepo.find({
			order: { nama: "ASC" },
		});
	}

	@Get("mata-pelajaran/:id")
	@Roles("guru", "siswa", "admin")
	async getMataPelajaranById(@Param("id") id: number) {
		return await this.mataPelajaranRepo.findOne({
			where: { id },
		});
	}

	@Post("mata-pelajaran")
	@Roles("admin")
	async createMataPelajaran(@Body() body: { nama: string }) {
		// Check if already exists
		const existing = await this.mataPelajaranRepo.findOne({
			where: { nama: body.nama },
		});

		if (existing) {
			throw new BadRequestException(`Mata pelajaran "${body.nama}" sudah ada`);
		}

		const mataPelajaran = this.mataPelajaranRepo.create({ nama: body.nama });
		return await this.mataPelajaranRepo.save(mataPelajaran);
	}

	@Put("mata-pelajaran/:id")
	@Roles("admin")
	async updateMataPelajaran(
		@Param("id") id: number,
		@Body() body: { nama: string },
	) {
		await this.mataPelajaranRepo.update(id, { nama: body.nama });
		return await this.mataPelajaranRepo.findOne({ where: { id } });
	}

	@Delete("mata-pelajaran/:id")
	@Roles("admin")
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteMataPelajaran(@Param("id") id: number) {
		await this.mataPelajaranRepo.delete(id);
	}

	// ============= FILE UPLOAD ENDPOINTS =============

	@Post("upload/materi")
	@Roles("guru", "admin")
	@UseInterceptors(FileInterceptor("file"))
	async uploadMateriFile(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		try {
			const result = await this.fileUploadService.uploadMateriFile(
				file,
				"materi",
			);
			return {
				message: "File berhasil diunggah",
				data: result,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new BadRequestException(`Gagal upload file: ${message}`);
		}
	}

	@Post("upload/konten")
	@Roles("guru", "admin")
	@UseInterceptors(FileInterceptor("file"))
	async uploadKontenFile(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		try {
			const result = await this.fileUploadService.uploadMateriFile(
				file,
				"konten",
			);

			// Auto-convert Word documents to PDF for preview
			if (result.fileType && result.fileType.includes("word")) {
				console.log(
					`[uploadKontenFile] Converting Word file: ${result.filePath}`,
				);
				const pdfPath = await this.documentConverterService.convertWordToPdf(
					result.filePath,
				);
				console.log(`[uploadKontenFile] Conversion result: ${pdfPath}`);
				if (pdfPath) {
					result.convertedPdfPath = pdfPath;
				}
			}

			return {
				message: "File berhasil diunggah",
				data: result,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new BadRequestException(`Gagal upload file: ${message}`);
		}
	}

	@Post("upload/image")
	@Roles("guru", "admin")
	@UseInterceptors(FileInterceptor("file"))
	async uploadImage(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException("File gambar harus diunggah");
		}

		try {
			// Validate file type
			const allowedImageTypes = [
				"image/jpeg",
				"image/png",
				"image/jpg",
				"image/gif",
				"image/webp",
			];
			if (!allowedImageTypes.includes(file.mimetype)) {
				throw new BadRequestException(
					"Hanya file gambar (JPG, PNG, GIF, WebP) yang diizinkan",
				);
			}

			// Validate file size (max 5MB for images)
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				throw new BadRequestException(
					"Ukuran gambar tidak boleh lebih dari 5 MB",
				);
			}

			const result = await this.fileUploadService.uploadMateriFile(
				file,
				"konten",
			);

			return {
				message: "Gambar berhasil diunggah",
				data: {
					imageUrl: result.filePath,
					fileName: result.fileName,
					fileType: result.fileType,
				},
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new BadRequestException(`Gagal upload gambar: ${message}`);
		}
	}

	@Get("upload/allowed-types")
	@Roles("guru", "admin", "siswa")
	getAllowedFileTypes() {
		return {
			allowedTypes: this.fileUploadService.getAllowedFileTypes(),
			maxSize: "50MB",
			message: "Tipe file yang diizinkan untuk upload",
		};
	}

	// ============= SOAL ESAI ENDPOINTS (KUIS ESSAY) =============
	@Post("soal-esai")
	@Roles("guru", "admin")
	async createSoalEsai(@Body() dto: CreateSoalEsaiDto) {
		return this.elearningService.createSoalEsai(dto);
	}

	@Get("soal-esai/tugas/:tugasId")
	@Roles("guru", "admin", "siswa")
	async getSoalEsaiByTugas(@Param("tugasId") tugasId: number) {
		return this.elearningService.getSoalEsaiByTugas(tugasId);
	}

	@Get("soal-esai/:id")
	@Roles("guru", "admin", "siswa")
	async getSoalEsaiById(@Param("id") id: number) {
		return this.elearningService.getSoalEsaiById(id);
	}

	@Put("soal-esai/:id")
	@Roles("guru", "admin")
	async updateSoalEsai(
		@Param("id") id: number,
		@Body() dto: UpdateSoalEsaiDto,
	) {
		return this.elearningService.updateSoalEsai(id, dto);
	}

	@Delete("soal-esai/:id")
	@Roles("guru", "admin")
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteSoalEsai(@Param("id") id: number) {
		return this.elearningService.deleteSoalEsai(id);
	}

	// ============= JAWABAN ESAI ENDPOINTS (KUIS ESSAY ANSWERS) =============
	@Post("jawaban-esai")
	@Roles("siswa")
	async submitJawabanEsai(@Request() req, @Body() dto: SubmitJawabanEsaiDto) {
		console.log(`\n[ENDPOINT] POST /jawaban-esai from student ${req.user.id}`);
		console.log(
			`[ENDPOINT] Soal ID: ${dto.soalEsaiId}, Answer length: ${
				dto.jawaban?.length || 0
			}`,
		);
		const result = await this.elearningService.createJawabanEsai(
			req.user.id,
			dto,
		);
		console.log(`[ENDPOINT] ✅ Quiz answer submit completed`);
		return result;
	}

	@Get("jawaban-esai/soal/:soalEsaiId")
	@Roles("guru", "admin", "siswa")
	async getJawabanEsaiBySoal(
		@Request() req,
		@Param("soalEsaiId") soalEsaiId: number,
	) {
		// If siswa, only return their own answer
		if (req.user.role === "siswa") {
			return this.elearningService.getJawabanEsaiBySoalForSiswa(
				soalEsaiId,
				req.user.id,
			);
		}
		// If guru/admin, return all answers for grading
		return this.elearningService.getJawabanEsaiBySoal(soalEsaiId);
	}

	@Get("jawaban-esai/tugas/:tugasId")
	@Roles("guru", "admin")
	async getJawabanEsaiByTugas(@Param("tugasId") tugasId: number) {
		console.log(`\n[ENDPOINT] GET /jawaban-esai/tugas/${tugasId}`);
		const result = await this.elearningService.getJawabanEsaiByTugas(tugasId);
		console.log(
			`[ENDPOINT] Returning ${result.data.length} grouped submissions for tugasId ${tugasId}`,
		);
		return result;
	}

	@Put("jawaban-esai/:id/nilai")
	@Roles("guru", "admin")
	async nilaiJawabanEsai(
		@Param("id") id: number,
		@Body() dto: { nilai: number; feedback?: string },
	) {
		return this.elearningService.nilaiJawabanEsai(id, dto);
	}

	// ============= VISIBILITY ENDPOINTS =============

	@Put("materi/:materiId/visibility")
	@Roles("guru", "admin")
	async updateMateriVisibility(
		@Param("materiId") materiId: number,
		@Body() dto: { visible: boolean },
	) {
		return this.materiService.updateVisibility(materiId, dto.visible);
	}

	@Put("tugas/:tugasId/visibility")
	@Roles("guru", "admin")
	async updateTugasVisibility(
		@Param("tugasId") tugasId: number,
		@Body() dto: { visible: boolean },
	) {
		return this.tugasService.updateVisibility(tugasId, dto.visible);
	}

	@Post("admin/fix-draft-submissions")
	@Roles("admin")
	async fixDraftSubmissions() {
		const count = await this.jawabanService.fixDraftSubmissionsWithFiles();
		return {
			success: true,
			message: `Fixed ${count} draft submissions with files`,
			fixed: count,
		};
	}

	@Get("admin/debug/tugas/:tugasId/jawaban-all")
	@Roles("admin")
	async debugGetAllJawabanByTugas(@Param("tugasId") tugasId: number) {
		console.log(`\n[DEBUG] Getting ALL jawaban for tugasId: ${tugasId}`);
		const jawaban = await this.jawabanService.findAllByTugasId(tugasId);
		console.log(`[DEBUG] Found ${jawaban.length} total submissions`);
		return {
			success: true,
			data: jawaban,
			total: jawaban.length,
			debug: "This shows ALL submissions regardless of status",
		};
	}
}
