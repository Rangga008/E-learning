import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { User } from "./entities/user.entity";
import { Guru } from "../guru/entities/guru.entity";

@Module({
	imports: [TypeOrmModule.forFeature([User, Guru])],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
