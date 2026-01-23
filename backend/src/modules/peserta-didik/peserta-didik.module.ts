import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PesertaDidikController } from "./controllers/peserta-didik.controller";
import { PesertaDidikService } from "./services/peserta-didik.service";
import { PesertaDidik } from "./entities/peserta-didik.entity";
import { User } from "../auth/entities/user.entity";

@Module({
	imports: [TypeOrmModule.forFeature([PesertaDidik, User])],
	controllers: [PesertaDidikController],
	providers: [PesertaDidikService],
})
export class PesertaDidikModule {}
