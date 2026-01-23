import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
	UseGuards,
} from "@nestjs/common";
import { AngkatanService } from "../services/angkatan.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { IsPublic } from "@/common/decorators/is-public.decorator";

@Controller("settings/angkatan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AngkatanController {
	constructor(private readonly angkatanService: AngkatanService) {}

	@Get()
	@IsPublic()
	async getAngkatan() {
		return await this.angkatanService.getAngkatanDropdown();
	}

	@Get("/:id")
	@IsPublic()
	async getAngkatanById(@Param("id") id: number) {
		return await this.angkatanService.getAngkatanById(id);
	}

	@Post()
	@Roles("admin")
	async createAngkatan(@Body() data: any) {
		return await this.angkatanService.createAngkatan(data);
	}

	@Put("/:id")
	@Roles("admin")
	async updateAngkatan(@Param("id") id: number, @Body() data: any) {
		return await this.angkatanService.updateAngkatan(id, data);
	}

	@Delete("/:id")
	@Roles("admin")
	async deleteAngkatan(@Param("id") id: number) {
		return await this.angkatanService.deleteAngkatan(id);
	}
}
