import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./controllers/admin.controller";
import { AdminService } from "./services/admin.service";
import { User } from "../auth/entities/user.entity";
import { PesertaDidik } from "../peserta-didik/entities/peserta-didik.entity";
import { Guru } from "../guru/entities/guru.entity";
import { Kelas } from "../kelas/entities/kelas.entity";
import { PesertaDidikService } from "../peserta-didik/services/peserta-didik.service";
import { GuruService } from "../guru/services/guru.service";

@Module({
	imports: [TypeOrmModule.forFeature([User, PesertaDidik, Guru, Kelas])],
	controllers: [AdminController],
	providers: [AdminService, PesertaDidikService, GuruService],
})
export class AdminModule {}
