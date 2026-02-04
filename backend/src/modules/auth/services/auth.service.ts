import {
	Injectable,
	BadRequestException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../entities/user.entity";
import { LoginDto } from "../dtos/login.dto";
import { RegisterDto } from "../dtos/register.dto";
import { Guru } from "../../guru/entities/guru.entity";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Guru)
		private guruRepository: Repository<Guru>,
		private jwtService: JwtService,
	) {}

	async register(registerDto: RegisterDto): Promise<Omit<User, "password">> {
		try {
			console.log("🔍 Register attempt:", registerDto.username);

			// Check if user already exists
			console.log("🔍 Checking existing user...");
			const existingUser = await this.userRepository.findOne({
				where: [
					{ username: registerDto.username },
					{ email: registerDto.email },
				],
			});

			if (existingUser) {
				throw new BadRequestException("Username atau email sudah terdaftar");
			}

			console.log("🔍 Hashing password...");
			const hashedPassword = await bcrypt.hash(registerDto.password, 10);

			console.log("🔍 Creating user entity...");
			const user = this.userRepository.create({
				username: registerDto.username,
				email: registerDto.email,
				password: hashedPassword,
				fullName: registerDto.fullName,
				role: registerDto.role,
				isActive: true,
			});

			console.log("🔍 Saving user to database...");
			const savedUser = (await this.userRepository.save(
				user,
			)) as unknown as User;

			console.log("✓ User registered successfully");
			// Return user tanpa password
			const { password, ...result } = savedUser;
			return result;
		} catch (error) {
			console.error("❌ Register error:", error.message);
			throw error;
		}
	}

	async login(loginDto: LoginDto) {
		try {
			console.log("🔑 Login attempt:", loginDto.username);
			const user = await this.userRepository.findOne({
				where: { username: loginDto.username },
				relations: ["guru"],
			});

			if (!user) {
				console.log("❌ User not found:", loginDto.username);
				throw new UnauthorizedException("Username atau password salah");
			}

			console.log("✓ User found, checking password...");
			console.log("Stored hash:", user.password.substring(0, 20) + "...");

			if (!user.isActive) {
				throw new UnauthorizedException("Akun Anda telah dinonaktifkan");
			}

			const isPasswordValid = await bcrypt.compare(
				loginDto.password,
				user.password,
			);
			console.log("Password match result:", isPasswordValid);

			if (!isPasswordValid) {
				throw new UnauthorizedException("Username atau password salah");
			}

			// Fetch guru data FIRST if role is guru
			let guruId = user.guruId || null;
			let guruData = null;

			if (user.role === "guru") {
				console.log("📚 Fetching guru data...");
				guruData = await this.guruRepository.findOne({
					where: { userId: user.id },
					relations: ["mataPelajaran", "kelasWaliList", "kelasMapelList"],
				});

				if (guruData) {
					guruId = guruData.id;
					console.log("✓ Guru found, ID:", guruId);
				}
			}

			const payload = {
				id: user.id,
				username: user.username,
				role: user.role,
				guruId: guruId,
			};

			console.log("🔑 Generating JWT token with guruId:", guruId);
			const access_token = this.jwtService.sign(payload, {
				expiresIn: "24h",
			});

			console.log("🔑 Token generated, returning response...");
			// Return user tanpa password
			const userResponse: any = {
				id: user.id,
				username: user.username,
				email: user.email,
				fullName: user.fullName,
				role: user.role,
				isActive: user.isActive,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			};

			// Add guru data if we fetched it earlier
			if (user.role === "guru" && guruData) {
				userResponse.guru = {
					id: guruData.id,
					nip: guruData.nip,
					namaLengkap: guruData.namaLengkap,
					mataPelajaranId: guruData.mataPelajaranId,
					mataPelajaran: guruData.mataPelajaran,
					kelasWali: guruData.kelasWali,
					kelasMapel: guruData.kelasMapel,
					kelasWaliList: guruData.kelasWaliList,
					kelasMapelList: guruData.kelasMapelList,
				};
			}

			const response = {
				access_token,
				user: userResponse,
			};

			console.log("✓ Login response prepared:", response);
			return response;
		} catch (error) {
			console.error("❌ Login error:", error.message);
			throw error;
		}
	}

	async validateUser(id: number) {
		const user = await this.userRepository.findOne({
			where: { id, isActive: true },
		});

		if (!user) {
			throw new UnauthorizedException("User tidak ditemukan atau tidak aktif");
		}

		return user;
	}

	async changePassword(
		userId: number,
		oldPassword: string,
		newPassword: string,
	) {
		const user = await this.userRepository.findOne({ where: { id: userId } });

		if (!user) {
			throw new BadRequestException("User tidak ditemukan");
		}

		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

		if (!isPasswordValid) {
			throw new BadRequestException("Password lama salah");
		}

		if (oldPassword === newPassword) {
			throw new BadRequestException(
				"Password baru tidak boleh sama dengan password lama",
			);
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;

		await this.userRepository.save(user);
		return { message: "Password berhasil diubah" };
	}
}
