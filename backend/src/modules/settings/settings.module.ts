import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Settings } from "./entities/settings.entity";
import { Tingkat } from "./entities/tingkat.entity";
import { Angkatan } from "./entities/angkatan.entity";
import { SettingsService } from "./services/settings.service";
import { SettingsController } from "./controllers/settings.controller";
import { TingkatService } from "./services/tingkat.service";
import { TingkatController } from "./controllers/tingkat.controller";
import { AngkatanService } from "./services/angkatan.service";
import { AngkatanController } from "./controllers/angkatan.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Settings, Tingkat, Angkatan])],
	providers: [SettingsService, TingkatService, AngkatanService],
	controllers: [SettingsController, TingkatController, AngkatanController],
	exports: [SettingsService, TingkatService, AngkatanService],
})
export class SettingsModule {}
