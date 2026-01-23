import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { SettingsService } from "../services/settings.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";

@Controller("settings")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
	constructor(private settingsService: SettingsService) {}

	@Get()
	@Roles("admin")
	async getSettings() {
		return this.settingsService.getSettings();
	}

	@Put()
	@Roles("admin")
	async updateSettings(@Body() data: any) {
		return this.settingsService.updateSettings(data);
	}

	@Put("levels")
	@Roles("admin")
	async updateLevels(@Body() levels: any[]) {
		return this.settingsService.updateLevels(levels);
	}
}
