import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KelasController } from "./controllers/kelas.controller";
import { KelasService } from "./services/kelas.service";
import { Kelas } from "./entities/kelas.entity";
import { Guru } from "../guru/entities/guru.entity";
import { PesertaDidik } from "../peserta-didik/entities/peserta-didik.entity";
import { Tingkat } from "../settings/entities/tingkat.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Kelas, Guru, PesertaDidik, Tingkat])],
	controllers: [KelasController],
	providers: [KelasService],
	exports: [KelasService],
})
export class KelasModule {}
