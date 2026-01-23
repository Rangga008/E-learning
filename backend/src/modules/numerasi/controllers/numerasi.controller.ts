import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	UseGuards,
	BadRequestException,
} from "@nestjs/common";
import { NumerasiService } from "../services/numerasi.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { GetUser } from "@/common/decorators/get-user.decorator";

@Controller("numerasi")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NumerasiController {
	constructor(private readonly numerasiService: NumerasiService) {}

	// Bank Soal
	@Post("soal")
	@Roles("admin", "guru")
	async createSoal(@Body() data: any) {
		return await this.numerasiService.createSoal(data);
	}

	@Get("soal/kategori/:kategori")
	@Roles("admin", "guru", "siswa")
	async getSoalByKategori(@Param("kategori") kategori: string) {
		return await this.numerasiService.getSoalByKategori(kategori);
	}

	@Get("soal/level/:level")
	@Roles("admin", "guru", "siswa")
	async getSoalByLevel(@Param("level") level: number) {
		return await this.numerasiService.getSoalByLevel(level);
	}

	@Get("soal/harian")
	@Roles("siswa")
	async getSoalHarian(@GetUser() user: any) {
		const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
		return await this.numerasiService.getSoalHarian(user.id, today);
	}

	// Jawaban
	@Post("jawaban/submit")
	@Roles("siswa")
	async submitJawaban(@GetUser() user: any, @Body() data: any) {
		if (!data.soalId || !Array.isArray(data.jawaban)) {
			throw new BadRequestException("soalId dan jawaban harus diisi");
		}
		return await this.numerasiService.submitJawaban({
			pesertaDidikId: user.id,
			...data,
		});
	}

	@Get("jawaban/:pesertaDidikId")
	@Roles("siswa", "guru", "admin")
	async getJawabanByPesertaDidik(
		@Param("pesertaDidikId") pesertaDidikId: number,
	) {
		return await this.numerasiService.getJawabanByPesertaDidik(pesertaDidikId);
	}

	@Get("jawaban/history/:pesertaDidikId")
	@Roles("siswa", "guru", "admin")
	async getJawabanHistory(
		@Param("pesertaDidikId") pesertaDidikId: number,
		@Query("days") days: number = 7,
	) {
		return await this.numerasiService.getJawabanHistory(pesertaDidikId, days);
	}

	// Level Configuration
	@Get("config/level/:level")
	@Roles("admin", "guru", "siswa")
	getLevelConfiguration(@Param("level") level: number) {
		return this.numerasiService.getLevelConfiguration(level);
	}

	// Utility
	@Get("utility/can-access")
	@Roles("siswa")
	canAccessMenu(@Query("hari") hari: string) {
		return { canAccess: this.numerasiService.canAccessMenu(hari) };
	}

	@Get("utility/topic/:hari")
	@Roles("siswa", "guru", "admin")
	getTopic(@Param("hari") hari: string) {
		return { topic: this.numerasiService.getTopicByDay(hari) };
	}

	@Get("progress/:pesertaDidikId")
	@Roles("siswa", "guru", "admin")
	async getProgress(@Param("pesertaDidikId") pesertaDidikId: number) {
		return await this.numerasiService.getProgressByStudent(pesertaDidikId);
	}
}
