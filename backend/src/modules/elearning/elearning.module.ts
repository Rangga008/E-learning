import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ElearningController } from "./controllers/elearning.controller";
import { ElearningService } from "./services/elearning.service";
import { MataPelajaran } from "./entities/mata-pelajaran.entity";
import { Materi } from "./entities/materi.entity";
import { SoalEsai } from "./entities/soal-esai.entity";
import { JawabanEsai } from "./entities/jawaban-esai.entity";
import { MateriEsai } from "./entities/materi-esai.entity";
import { SoalJawabanEsai } from "./entities/soal-jawaban-esai.entity";
import { Kelas } from "../kelas/entities/kelas.entity";
import { Guru } from "../guru/entities/guru.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			MataPelajaran,
			Materi,
			SoalEsai,
			JawabanEsai,
			MateriEsai,
			SoalJawabanEsai,
			Kelas,
			Guru,
		]),
	],
	controllers: [ElearningController],
	providers: [ElearningService],
})
export class ElearningModule {}
