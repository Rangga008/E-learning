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
} from "@nestjs/common";
import { KelasService } from "../services/kelas.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { IsPublic } from "../../../common/decorators/is-public.decorator";

@Controller("admin/kelas")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class KelasController {
	constructor(private kelasService: KelasService) {}

	@Get()
	async getAllKelas(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		return this.kelasService.getAllKelas(pageNum, limitNum);
	}

	@Get("dropdown/all")
	@IsPublic()
	async getAllKelasForDropdown() {
		return this.kelasService.getAllKelasForDropdown();
	}

	@Get("dropdown/without-wali")
	@IsPublic()
	async getKelasWithoutWali() {
		return this.kelasService.getKelasWithoutWali();
	}

	@Get(":id")
	async getKelasById(@Param("id") id: number) {
		return this.kelasService.getKelasById(id);
	}

	@Post()
	async createKelas(@Body() data: any) {
		return this.kelasService.createKelas(data);
	}

	@Put(":id")
	async updateKelas(@Param("id") id: number, @Body() data: any) {
		return this.kelasService.updateKelas(id, data);
	}

	@Delete(":id")
	async deleteKelas(@Param("id") id: number) {
		return this.kelasService.deleteKelas(id);
	}

	@Post(":id/siswa/:siswaId")
	async assignSiswaToKelas(
		@Param("id") kelasId: number,
		@Param("siswaId") siswaId: number,
	) {
		return this.kelasService.assignSiswaToKelas(kelasId, siswaId);
	}

	@Post(":id/guru-mapel/:guruId")
	async addGuruMapelToKelas(
		@Param("id") kelasId: number,
		@Param("guruId") guruId: number,
	) {
		return this.kelasService.addGuruMapelToKelas(kelasId, guruId);
	}

	@Delete(":id/guru-mapel/:guruId")
	async removeGuruMapelFromKelas(
		@Param("id") kelasId: number,
		@Param("guruId") guruId: number,
	) {
		return this.kelasService.removeGuruMapelFromKelas(kelasId, guruId);
	}

	@Delete(":id/wali-kelas")
	async removeWaliKelas(@Param("id") kelasId: number) {
		return this.kelasService.removeWaliKelas(kelasId);
	}
}
