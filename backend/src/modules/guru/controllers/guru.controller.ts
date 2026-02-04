import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
	Query,
	UseInterceptors,
	UploadedFile,
	UseGuards,
	BadRequestException,
	Request,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { GuruService } from "../services/guru.service";
import { CreateGuruDto } from "../dtos/create-guru.dto";
import { UpdateGuruDto } from "../dtos/update-guru.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";

@Controller("guru")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuruController {
	constructor(private readonly guruService: GuruService) {}

	@Post()
	@Roles("admin")
	async create(@Body() createGuruDto: CreateGuruDto) {
		return await this.guruService.create(createGuruDto);
	}

	@Get()
	@Roles("admin", "guru")
	async findAll(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		return await this.guruService.findAll(pageNum, limitNum);
	}

	@Get("mata-pelajaran")
	@Roles("guru")
	async getMataPelajaran(@Request() req) {
		return await this.guruService.getMataPelajaranByUserId(req.user.id);
	}

	@Get("kelas/:kelas")
	@Roles("admin", "guru")
	async findByKelas(@Param("kelas") kelas: string) {
		return await this.guruService.findByKelas(kelas);
	}

	@Get("mapel/:mapelId")
	@Roles("admin", "guru")
	async findByMapel(@Param("mapelId") mapelId: number) {
		return await this.guruService.findByMapel(mapelId);
	}

	@Get(":id")
	@Roles("admin", "guru")
	async findOne(@Param("id") id: number) {
		return await this.guruService.findOne(id);
	}

	@Put(":id")
	@Roles("admin")
	async update(@Param("id") id: number, @Body() updateGuruDto: UpdateGuruDto) {
		return await this.guruService.update(id, updateGuruDto);
	}

	@Delete(":id")
	@Roles("admin")
	async remove(@Param("id") id: number) {
		return await this.guruService.remove(id);
	}

	@Post("import")
	@Roles("admin")
	@UseInterceptors(FileInterceptor("file"))
	async import(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		try {
			return await this.guruService.importFromExcel(file);
		} catch (error) {
			throw new BadRequestException("Gagal mengimport file: " + error.message);
		}
	}

	// Dashboard endpoints
	@Get("dashboard/stats/:guruId")
	@Roles("guru")
	async getDashboardStats(@Param("guruId") guruId: number) {
		// Return teacher dashboard stats
		return {
			perluDiperiksa: 12,
			absenHariIni: 5,
			totalSiswa: 32,
			totalMapel: 11,
		};
	}

	@Get("dashboard/absent/:guruId")
	@Roles("guru")
	async getAbsentStudents(@Param("guruId") guruId: number) {
		// Return absent students for today
		return [
			{ nisn: "202400001", nama: "Ahmad Rizki", nilai: 0, status: "Absen" },
			{ nisn: "202400002", nama: "Budi Santoso", nilai: 0, status: "Absen" },
			{ nisn: "202400003", nama: "Citra Dewi", nilai: 0, status: "Absen" },
			{ nisn: "202400004", nama: "Diana Putri", nilai: 0, status: "Absen" },
			{ nisn: "202400005", nama: "Eka Susanti", nilai: 0, status: "Absen" },
		];
	}

	@Get("dashboard/pending-essays/:guruId")
	@Roles("guru")
	async getPendingEssays(@Param("guruId") guruId: number) {
		// Return essays pending grading
		return {
			count: 12,
			essays: [
				{
					id: 1,
					nisn: "202400001",
					nama: "Ahmad Rizki",
					mapel: "Bahasa Indonesia",
					submittedAt: "2025-01-23 10:30",
				},
				{
					id: 2,
					nisn: "202400002",
					nama: "Budi Santoso",
					mapel: "Pendidikan Pancasila",
					submittedAt: "2025-01-23 11:15",
				},
			],
		};
	}
}
