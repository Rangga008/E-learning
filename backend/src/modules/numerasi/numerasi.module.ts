import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NumerasiController } from "./controllers/numerasi.controller";
import { NumerasiService } from "./services/numerasi.service";
import { NumerasiSettingsService } from "./services/numerasi-settings.service";
import { SoalNumerasi } from "./entities/soal-numerasi.entity";
import { JawabanNumerasi } from "./entities/jawaban-numerasi.entity";
import { SettingsNumerasi } from "./entities/settings-numerasi.entity";
import { PesertaDidik } from "../peserta-didik/entities/peserta-didik.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			SoalNumerasi,
			JawabanNumerasi,
			SettingsNumerasi,
			PesertaDidik,
		]),
	],
	controllers: [NumerasiController],
	providers: [NumerasiService, NumerasiSettingsService],
	exports: [NumerasiSettingsService], // Export untuk digunakan modul lain
})
export class NumerasiModule {}
