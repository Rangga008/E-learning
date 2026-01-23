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
import { TingkatService } from "../services/tingkat.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { IsPublic } from "@/common/decorators/is-public.decorator";

@Controller("settings/tingkat")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TingkatController {
	constructor(private readonly tingkatService: TingkatService) {}

	@Get()
	@IsPublic()
	async getTingkat() {
		return await this.tingkatService.getTingkatDropdown();
	}

	@Get("/:id")
	@IsPublic()
	async getTingkatById(@Param("id") id: number) {
		return await this.tingkatService.getTingkatById(id);
	}

	@Post()
	@Roles("admin")
	async createTingkat(@Body() data: any) {
		return await this.tingkatService.createTingkat(data);
	}

	@Put("/:id")
	@Roles("admin")
	async updateTingkat(@Param("id") id: number, @Body() data: any) {
		return await this.tingkatService.updateTingkat(id, data);
	}

	@Delete("/:id")
	@Roles("admin")
	async deleteTingkat(@Param("id") id: number) {
		return await this.tingkatService.deleteTingkat(id);
	}
}
