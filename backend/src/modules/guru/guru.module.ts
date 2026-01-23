import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GuruController } from "./controllers/guru.controller";
import { GuruService } from "./services/guru.service";
import { Guru } from "./entities/guru.entity";
import { User } from "../auth/entities/user.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Guru, User])],
	controllers: [GuruController],
	providers: [GuruService],
})
export class GuruModule {}
