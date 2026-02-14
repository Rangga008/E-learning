import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "../../common/common.module";
import { ElearningController } from "./controllers/elearning.controller";
import { MateriService } from "./services/materi.service";
import { TugasService } from "./services/tugas.service";
import { JawabanTugasService } from "./services/jawaban-tugas.service";
import { NilaiTugasService } from "./services/nilai-tugas.service";
import { NotifikasiService } from "./services/notifikasi.service";
import { GuruMapelService } from "./services/guru-mapel.service";
import { ElearningService } from "./services/elearning.service";
import { RencanaService } from "./services/rencana.service";
import { KontenService } from "./services/konten.service";
import { FileUploadService } from "./services/file-upload.service";
import { DocumentConverterService } from "../../common/services/document-converter.service";
import { MataPelajaran } from "./entities/mata-pelajaran.entity";
import { Materi } from "./entities/materi.entity";
import { Tugas } from "./entities/tugas.entity";
import { JawabanTugas } from "./entities/jawaban-tugas.entity";
import { NilaiTugas } from "./entities/nilai-tugas.entity";
import { Notifikasi } from "./entities/notifikasi.entity";
import { GuruMapel } from "./entities/guru-mapel.entity";
import { SoalEsai } from "./entities/soal-esai.entity";
import { JawabanEsai } from "./entities/jawaban-esai.entity";
import { RencanaPembelajaran } from "./entities/rencana.entity";
import { KontenMateri } from "./entities/konten.entity";
import { Kelas } from "../kelas/entities/kelas.entity";
import { Guru } from "../guru/entities/guru.entity";
import { PesertaDidik } from "../peserta-didik/entities/peserta-didik.entity";

@Module({
	imports: [
		CommonModule,
		TypeOrmModule.forFeature([
			MataPelajaran,
			Materi,
			Tugas,
			JawabanTugas,
			NilaiTugas,
			Notifikasi,
			GuruMapel,
			SoalEsai,
			JawabanEsai,
			RencanaPembelajaran,
			KontenMateri,
			Kelas,
			Guru,
			PesertaDidik,
		]),
	],
	controllers: [ElearningController],
	providers: [
		ElearningService,
		MateriService,
		TugasService,
		JawabanTugasService,
		NilaiTugasService,
		NotifikasiService,
		GuruMapelService,
		RencanaService,
		KontenService,
		FileUploadService,
		DocumentConverterService,
	],
	exports: [
		MateriService,
		TugasService,
		JawabanTugasService,
		NilaiTugasService,
		NotifikasiService,
		GuruMapelService,
		RencanaService,
		KontenService,
		FileUploadService,
		DocumentConverterService,
	],
})
export class ElearningModule {}
