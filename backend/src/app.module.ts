import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { CommonModule } from "./common/common.module";

const configuration = require("./config/configuration").default;

// Modules
import { AuthModule } from "./modules/auth/auth.module";
import { PesertaDidikModule } from "./modules/peserta-didik/peserta-didik.module";
import { GuruModule } from "./modules/guru/guru.module";
import { KelasModule } from "./modules/kelas/kelas.module";
import { ElearningModule } from "./modules/elearning/elearning.module";
import { NumerasiModule } from "./modules/numerasi/numerasi.module";
import { PelaporanModule } from "./modules/pelaporan/pelaporan.module";
import { AdminModule } from "./modules/admin/admin.module";
import { SettingsModule } from "./modules/settings/settings.module";

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), "uploads"),
			serveRoot: "/api/uploads",
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: "mysql",
				host: configService.get("database.host"),
				port: configService.get("database.port"),
				username: configService.get("database.username"),
				password: configService.get("database.password"),
				database: configService.get("database.database"),
				entities: [__dirname + "/modules/**/entities/*.entity{.ts,.js}"],
				synchronize: configService.get("database.synchronize"),
				logging: configService.get("database.logging"),
			}),
		}),
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get("jwt.secret"),
				signOptions: { expiresIn: configService.get("jwt.expiresIn") },
			}),
		}),
		PassportModule,
		CommonModule,
		AuthModule,
		PesertaDidikModule,
		GuruModule,
		KelasModule,
		ElearningModule,
		NumerasiModule,
		PelaporanModule,
		AdminModule,
		SettingsModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
