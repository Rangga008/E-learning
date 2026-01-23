import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DataSource } from "typeorm";
import { User, UserRole } from "../modules/auth/entities/user.entity";
import { MataPelajaran } from "../modules/elearning/entities/mata-pelajaran.entity";
import { Angkatan } from "../modules/settings/entities/angkatan.entity";
import * as bcrypt from "bcryptjs";

async function runSeeds() {
	const app = await NestFactory.create(AppModule);
	const dataSource = app.get(DataSource);

	// Seed Mata Pelajaran
	const mataPelajaranRepository = dataSource.getRepository(MataPelajaran);
	const existingMP = await mataPelajaranRepository.count();

	if (existingMP === 0) {
		const mataPelajaran = [
			{ nama: "Matematika", deskripsi: "Pelajaran Matematika" },
			{ nama: "Bahasa Indonesia", deskripsi: "Pelajaran Bahasa Indonesia" },
			{ nama: "Bahasa Inggris", deskripsi: "Pelajaran Bahasa Inggris" },
			{ nama: "IPA", deskripsi: "Pelajaran Ilmu Pengetahuan Alam" },
			{ nama: "IPS", deskripsi: "Pelajaran Ilmu Pengetahuan Sosial" },
			{ nama: "Pendidikan Jasmani", deskripsi: "Pelajaran Pendidikan Jasmani" },
			{ nama: "Seni", deskripsi: "Pelajaran Seni" },
		];

		await mataPelajaranRepository.save(mataPelajaran);
		console.log("✓ Mata Pelajaran seeded successfully");
	}

	// Seed Admin User
	const userRepository = dataSource.getRepository(User);
	const adminExists = await userRepository.findOne({
		where: { username: "admin" },
	});

	const hashedPassword = await bcrypt.hash("admin123", 10);

	if (!adminExists) {
		const adminUser = userRepository.create({
			username: "admin",
			email: "admin@lms.local",
			fullName: "Administrator",
			password: hashedPassword,
			role: UserRole.ADMIN,
			isActive: true,
		});

		await userRepository.save(adminUser);
		console.log("✓ Admin user created with password: admin123");
	} else {
		// Update existing admin password and ensure active
		await userRepository.update(
			{ username: "admin" },
			{ password: hashedPassword, isActive: true },
		);
		console.log("✓ Admin password updated to: admin123 and account activated");
	}

	// Seed Angkatan
	const angkatanRepository = dataSource.getRepository(Angkatan);
	const existingAngkatan = await angkatanRepository.count();

	if (existingAngkatan === 0) {
		const angkatanData = [
			// SD (Sekolah Dasar)
			{
				levelAngkatan: 1,
				sekolah: "SD",
				namaAngkatan: "Kelas 1 SD 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 2,
				sekolah: "SD",
				namaAngkatan: "Kelas 2 SD 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 3,
				sekolah: "SD",
				namaAngkatan: "Kelas 3 SD 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 4,
				sekolah: "SD",
				namaAngkatan: "Kelas 4 SD 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 5,
				sekolah: "SD",
				namaAngkatan: "Kelas 5 SD 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 6,
				sekolah: "SD",
				namaAngkatan: "Kelas 6 SD 2025/2026",
				aktifkan: true,
			},
			// SMP (Sekolah Menengah Pertama)
			{
				levelAngkatan: 7,
				sekolah: "SMP",
				namaAngkatan: "Kelas 7 SMP 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 8,
				sekolah: "SMP",
				namaAngkatan: "Kelas 8 SMP 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 9,
				sekolah: "SMP",
				namaAngkatan: "Kelas 9 SMP 2025/2026",
				aktifkan: true,
			},
			// SMA (Sekolah Menengah Atas)
			{
				levelAngkatan: 10,
				sekolah: "SMA",
				namaAngkatan: "Kelas 10 SMA 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 11,
				sekolah: "SMA",
				namaAngkatan: "Kelas 11 SMA 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 12,
				sekolah: "SMA",
				namaAngkatan: "Kelas 12 SMA 2025/2026",
				aktifkan: true,
			},
			// K (Kejuruan)
			{
				levelAngkatan: 1,
				sekolah: "K",
				namaAngkatan: "Kelas 1 Kejuruan 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 2,
				sekolah: "K",
				namaAngkatan: "Kelas 2 Kejuruan 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 3,
				sekolah: "K",
				namaAngkatan: "Kelas 3 Kejuruan 2025/2026",
				aktifkan: true,
			},
			{
				levelAngkatan: 4,
				sekolah: "K",
				namaAngkatan: "Kelas 4 Kejuruan 2025/2026",
				aktifkan: true,
			},
		];

		await angkatanRepository.save(angkatanData);
		console.log("✓ Angkatan seeded successfully (16 classes)");
	}

	console.log("✓ All seeds completed!");
	await app.close();
}

runSeeds().catch((err) => {
	console.error("Seeding failed:", err);
	process.exit(1);
});
