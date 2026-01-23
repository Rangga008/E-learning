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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PesertaDidikService } from "../services/peserta-didik.service";
import { CreatePesertaDidikDto } from "../dtos/create-peserta-didik.dto";
import { UpdatePesertaDidikDto } from "../dtos/update-peserta-didik.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";

@Controller("peserta-didik")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PesertaDidikController {
	constructor(private readonly pesertaDidikService: PesertaDidikService) {}

	@Post()
	@Roles("admin", "guru")
	async create(@Body() createPesertaDidikDto: CreatePesertaDidikDto) {
		return await this.pesertaDidikService.create(createPesertaDidikDto);
	}

	@Get()
	@Roles("admin", "guru", "siswa")
	async findAll(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
		@Query("search") search?: string,
	) {
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		return await this.pesertaDidikService.findAll(pageNum, limitNum, search);
	}

	@Get("kelas/:kelasId")
	@Roles("admin", "guru")
	async findByKelas(@Param("kelasId") kelasId: string) {
		return await this.pesertaDidikService.findByKelas(parseInt(kelasId));
	}

	@Get("available/list")
	@Roles("admin", "guru")
	async findAvailable() {
		return await this.pesertaDidikService.findAvailable();
	}

	@Get(":id")
	@Roles("admin", "guru", "siswa")
	async findOne(@Param("id") id: number) {
		return await this.pesertaDidikService.findOne(id);
	}

	@Put(":id")
	@Roles("admin", "guru")
	async update(
		@Param("id") id: number,
		@Body() updatePesertaDidikDto: UpdatePesertaDidikDto,
	) {
		return await this.pesertaDidikService.update(id, updatePesertaDidikDto);
	}

	@Delete(":id")
	@Roles("admin")
	async remove(@Param("id") id: number) {
		return await this.pesertaDidikService.remove(id);
	}

	@Post("import")
	@Roles("admin")
	@UseInterceptors(FileInterceptor("file"))
	async import(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException("File harus diunggah");
		}

		try {
			return await this.pesertaDidikService.importFromExcel(file);
		} catch (error) {
			throw new BadRequestException("Gagal mengimport file: " + error.message);
		}
	}

	// Dashboard endpoints
	@Get("dashboard/stats/:pesertaDidikId")
	@Roles("siswa")
	async getDashboardStats(@Param("pesertaDidikId") pesertaDidikId: number) {
		const student = await this.pesertaDidikService.findOne(pesertaDidikId);
		const getLevelInfo = (lvl: number) => {
			const levels: Record<
				number,
				{ soal: number; kkm: number; waktu: number }
			> = {
				1: { soal: 100, kkm: 90, waktu: 30 },
				2: { soal: 120, kkm: 90, waktu: 40 },
				3: { soal: 150, kkm: 85, waktu: 50 },
				4: { soal: 180, kkm: 80, waktu: 60 },
				5: { soal: 200, kkm: 75, waktu: 70 },
				6: { soal: 250, kkm: 70, waktu: 90 },
				7: { soal: 300, kkm: 65, waktu: 120 },
			};
			return levels[lvl] || levels[1];
		};

		const levelInfo = getLevelInfo(student.level);
		return {
			level: student.level,
			poin: student.poin,
			progressPercent: 33,
			totalSoal: levelInfo.soal,
			kkm: levelInfo.kkm,
		};
	}

	@Get("dashboard/mapels/:pesertaDidikId")
	@Roles("siswa")
	async getDashboardMapels(@Param("pesertaDidikId") pesertaDidikId: number) {
		// Return E-Learning subjects with task counts from database
		const mapels = [
			{ id: 1, name: "Pendidikan Pancasila", taskCount: 2, color: "red" },
			{ id: 2, name: "Bahasa Indonesia", taskCount: 1, color: "blue" },
			{ id: 3, name: "Matematika", taskCount: 3, color: "purple" },
			{ id: 4, name: "IPAS", taskCount: 0, color: "green" },
			{ id: 5, name: "Bahasa Inggris", taskCount: 2, color: "orange" },
			{ id: 6, name: "Seni Musik", taskCount: 1, color: "pink" },
		];
		return mapels;
	}
}
