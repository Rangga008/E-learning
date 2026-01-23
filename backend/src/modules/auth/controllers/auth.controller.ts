import {
	Controller,
	Post,
	Body,
	BadRequestException,
	UnauthorizedException,
	UseGuards,
	Req,
	Get,
	ForbiddenException,
} from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { IsPublic } from "@/common/decorators/is-public.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { RegisterDto } from "../dtos/register.dto";
import { LoginDto } from "../dtos/login.dto";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("admin")
	@Post("register")
	async register(@Req() req, @Body() registerDto: RegisterDto) {
		console.log("📝 Register called by admin");
		try {
			const result = await this.authService.register(registerDto);
			return {
				success: true,
				message: "User berhasil dibuat",
				data: result,
			};
		} catch (error: any) {
			console.error("❌ Error:", error);
			throw new BadRequestException(error.message || "Gagal membuat user");
		}
	}

	@IsPublic()
	@Post("login")
	async login(@Body() loginDto: LoginDto) {
		console.log("🔑 Login called");
		try {
			const result = await this.authService.login(loginDto);
			return {
				success: true,
				message: "Login berhasil",
				data: result,
			};
		} catch (error: any) {
			console.error("❌ Login Error Details:", {
				message: error.message,
				stack: error.stack,
				fullError: error,
			});
			throw new UnauthorizedException(
				error.message || "Username atau password salah",
			);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post("change-password")
	async changePassword(
		@Req() req,
		@Body() body: { oldPassword: string; newPassword: string },
	) {
		try {
			const result = await this.authService.changePassword(
				req.user.id,
				body.oldPassword,
				body.newPassword,
			);
			return {
				success: true,
				message: result.message,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	async getCurrentUser(@Req() req) {
		return {
			success: true,
			data: req.user,
		};
	}
}
