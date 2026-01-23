import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PelaporanController } from "./controllers/pelaporan.controller";
import { PelaporanService } from "./services/pelaporan.service";

@Module({
	imports: [TypeOrmModule.forFeature([])],
	controllers: [PelaporanController],
	providers: [PelaporanService],
})
export class PelaporanModule {}
