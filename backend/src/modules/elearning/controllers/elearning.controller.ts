import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
	UseGuards,
	BadRequestException,
	Query,
} from "@nestjs/common";
import { ElearningService } from "../services/elearning.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { GetUser } from "@/common/decorators/get-user.decorator";
import { IsPublic } from "@/common/decorators/is-public.decorator";

@Controller("elearning")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElearningController {
	constructor(private readonly elearningService: ElearningService) {}

	// Mata Pelajaran
	@Get("mata-pelajaran")
	@Roles("admin", "guru", "siswa")
	async getMataPelajaran() {
		return await this.elearningService.getMataPelajaran();
	}

	@Get("dropdown/mata-pelajaran")
	@IsPublic()
	async getMataPelajaranForDropdown(@Query("kelas") kelasId?: string) {
		return await this.elearningService.getMataPelajaranByKelas(
			kelasId ? parseInt(kelasId) : undefined,
		);
	}

	@Post("mata-pelajaran")
	@Roles("admin")
	async createMataPelajaran(@Body() data: any) {
		return await this.elearningService.createMataPelajaran(data);
	}

	@Put("mata-pelajaran/:id")
	@Roles("admin")
	async updateMataPelajaran(@Param("id") id: number, @Body() data: any) {
		return await this.elearningService.updateMataPelajaran(id, data);
	}

	@Delete("mata-pelajaran/:id")
	@Roles("admin")
	async deleteMataPelajaran(@Param("id") id: number) {
		return await this.elearningService.deleteMataPelajaran(id);
	}

	// Materi
	@Get("materi/:mataPelajaranId")
	@Roles("admin", "guru", "siswa")
	async getMateriByMapel(@Param("mataPelajaranId") mataPelajaranId: number) {
		return await this.elearningService.getMateriByMapel(mataPelajaranId);
	}

	@Post("materi")
	@Roles("admin", "guru")
	async createMateri(@Body() data: any) {
		return await this.elearningService.createMateri(data);
	}

	@Put("materi/:id")
	@Roles("admin", "guru")
	async updateMateri(@Param("id") id: number, @Body() data: any) {
		return await this.elearningService.updateMateri(id, data);
	}

	// Soal Esai
	@Get("soal-esai/:materiId")
	@Roles("admin", "guru", "siswa")
	async getSoalEsaiByMateri(@Param("materiId") materiId: number) {
		return await this.elearningService.getSoalEsaiByMateri(materiId);
	}

	@Post("soal-esai")
	@Roles("admin", "guru")
	async createSoalEsai(@Body() data: any) {
		return await this.elearningService.createSoalEsai(data);
	}

	@Put("soal-esai/:id")
	@Roles("admin", "guru")
	async updateSoalEsai(@Param("id") id: number, @Body() data: any) {
		return await this.elearningService.updateSoalEsai(id, data);
	}

	// Jawaban Esai
	@Post("jawaban-esai/submit")
	@Roles("siswa")
	async submitJawaban(
		@GetUser() user: any,
		@Body() body: { soalEsaiId: number; jawaban: string },
	) {
		if (!body.soalEsaiId || !body.jawaban) {
			throw new BadRequestException("soalEsaiId dan jawaban harus diisi");
		}
		return await this.elearningService.submitJawaban(
			user.id,
			body.soalEsaiId,
			body.jawaban,
		);
	}

	@Get("jawaban-esai/perlu-diperiksa")
	@Roles("guru", "admin")
	async getJawabanPerluDiperiksa() {
		return await this.elearningService.getJawabanPerluDiperiksa();
	}

	@Get("jawaban-esai/by-siswa/:pesertaDidikId")
	@Roles("siswa", "guru", "admin")
	async getJawabanBySiswa(@Param("pesertaDidikId") pesertaDidikId: number) {
		return await this.elearningService.getJawabanBySiswa(pesertaDidikId);
	}

	@Put("jawaban-esai/:id/nilai")
	@Roles("guru", "admin")
	async nilaiJawaban(
		@Param("id") id: number,
		@Body() body: { nilai: number; catatan?: string },
	) {
		if (body.nilai === undefined || body.nilai === null) {
			throw new BadRequestException("Nilai harus diisi");
		}
		if (body.nilai < 0 || body.nilai > 100) {
			throw new BadRequestException("Nilai harus antara 0-100");
		}
		return await this.elearningService.nilaiJawaban(
			id,
			body.nilai,
			body.catatan,
		);
	}
}
