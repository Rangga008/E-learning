import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Settings } from "../entities/settings.entity";

@Injectable()
export class SettingsService {
	constructor(
		@InjectRepository(Settings)
		private settingsRepository: Repository<Settings>,
	) {}

	async getSettings() {
		let settings = await this.settingsRepository.findOne({ where: { id: 1 } });

		if (!settings) {
			settings = this.settingsRepository.create({
				id: 1,
				appName: "LMS Sanggar Belajar",
				appSlogan: "Platform Pembelajaran Interaktif",
				schoolName: "Sanggar Belajar",
				schoolAddress: "Indonesia",
				schoolEmail: "info@sanggar-belajar.id",
				schoolPhone: "+62-123-456-7890",
				levels: [
					{ id: 1, name: "Level 1", description: "Pemula" },
					{ id: 2, name: "Level 2", description: "Dasar" },
					{ id: 3, name: "Level 3", description: "Menengah" },
					{ id: 4, name: "Level 4", description: "Menengah Atas" },
					{ id: 5, name: "Level 5", description: "Lanjutan" },
					{ id: 6, name: "Level 6", description: "Mahir" },
					{ id: 7, name: "Level 7", description: "Expert" },
				],
			});
			await this.settingsRepository.save(settings);
		}

		return { success: true, data: settings };
	}

	async updateSettings(data: Partial<Settings>) {
		let settings = await this.settingsRepository.findOne({ where: { id: 1 } });

		if (!settings) {
			settings = this.settingsRepository.create({ id: 1, ...data });
		} else {
			Object.assign(settings, data);
		}

		await this.settingsRepository.save(settings);
		return {
			success: true,
			message: "Settings berhasil diperbarui",
			data: settings,
		};
	}

	async updateLevels(levels: any[]) {
		let settings = await this.settingsRepository.findOne({ where: { id: 1 } });

		if (!settings) {
			settings = this.settingsRepository.create({ id: 1, levels });
		} else {
			settings.levels = levels;
		}

		await this.settingsRepository.save(settings);
		return {
			success: true,
			message: "Levels berhasil diperbarui",
			data: settings,
		};
	}
}
