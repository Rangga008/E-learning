import { Controller, Get, Query, Post, Body } from "@nestjs/common";
import { PelaporanService } from "../services/pelaporan.service";

@Controller("pelaporan")
export class PelaporanController {
	constructor(private readonly pelaporanService: PelaporanService) {}

	// E-Learning Reports
	@Get("elearning")
	async getRekapElearning(@Query() filters: any) {
		return await this.pelaporanService.getRekapElearning(filters);
	}

	@Get("elearning/grafik-ketuntasan")
	async getGrafikKetuntasan(@Query() filters: any) {
		return await this.pelaporanService.getGrafikKetuntasan(filters);
	}

	@Post("elearning/export")
	async exportElearning(@Body() data: any) {
		return await this.pelaporanService.exportToExcel(data);
	}

	// Numerasi Reports
	@Get("berhitung")
	async getRekapBerhitung(@Query() filters: any) {
		return await this.pelaporanService.getRekapBerhitung(filters);
	}

	@Get("berhitung/grafik-kelemahan/:pesertaDidikId")
	async getGrafikKelemahan(@Query("pesertaDidikId") pesertaDidikId: number) {
		return await this.pelaporanService.getGrafikKelemahan(pesertaDidikId);
	}

	@Get("berhitung/distribusi-level")
	async getDistribusiLevel() {
		return await this.pelaporanService.getDistribusiLevel();
	}

	@Get("berhitung/tren-perkembangan/:pesertaDidikId")
	async getTrenPerkembangan(@Query("pesertaDidikId") pesertaDidikId: number) {
		return await this.pelaporanService.getTrenPerkembangan(pesertaDidikId);
	}

	@Get("berhitung/rapor/:pesertaDidikId")
	async printRaporNumerasi(@Query("pesertaDidikId") pesertaDidikId: number) {
		return await this.pelaporanService.printRaporNumerasi(pesertaDidikId);
	}

	@Post("berhitung/export")
	async exportBerhitung(@Body() data: any) {
		return await this.pelaporanService.exportToExcel(data);
	}
}
