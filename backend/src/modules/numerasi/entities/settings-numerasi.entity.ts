import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

export enum HariKerja {
	SENIN = "senin",
	SELASA = "selasa",
	RABU = "rabu",
	KAMIS = "kamis",
	JUMAT = "jumat",
	SABTU = "sabtu",
	MINGGU = "minggu",
}

export enum Topik {
	PENJUMLAHAN = "penjumlahan",
	PENGURANGAN = "pengurangan",
	PERKALIAN = "perkalian",
	PEMBAGIAN = "pembagian",
	CAMPURAN = "campuran",
}

export interface LevelConfig {
	level: number;
	jumlahSoal: number;
	kkm: number; // Kriteria Ketuntasan Minimal
	waktuMenit: number;
	isSoalCerita?: boolean; // Level 6+
	isAkm?: boolean; // Level 7
}

@Entity("settings_numerasi")
export class SettingsNumerasi {
	@PrimaryGeneratedColumn()
	id: number;

	// Aturan Waktu
	@Column({ default: "00:01" })
	jamMulai: string; // Format HH:MM

	@Column({ default: "23:59" })
	jamSelesai: string;

	@Column("simple-json", { nullable: true })
	hariKerja: HariKerja[];

	// Topik Harian
	@Column({ default: "penjumlahan" })
	topikSenin: Topik;

	@Column({ default: "pengurangan" })
	topikSelasa: Topik;

	@Column({ default: "perkalian" })
	topikRabu: Topik;

	@Column({ default: "pembagian" })
	topikKamis: Topik;

	@Column({ default: "campuran" })
	topikJumat: Topik;

	// Level Configurations (JSON)
	@Column("simple-json")
	levelConfigs: LevelConfig[] = [
		{ level: 1, jumlahSoal: 100, kkm: 90, waktuMenit: 30 },
		{ level: 2, jumlahSoal: 87, kkm: 86, waktuMenit: 40 },
		{ level: 3, jumlahSoal: 73, kkm: 82, waktuMenit: 50 },
		{ level: 4, jumlahSoal: 60, kkm: 78, waktuMenit: 60 },
		{ level: 5, jumlahSoal: 47, kkm: 74, waktuMenit: 70 },
		{ level: 6, jumlahSoal: 33, kkm: 70, waktuMenit: 80, isSoalCerita: true },
		{ level: 7, jumlahSoal: 20, kkm: 66, waktuMenit: 90, isAkm: true },
	];

	// Mode Latihan
	@Column({ default: 50 })
	latihanJumlahSoal: number;

	@Column({ default: 30 })
	latihanWaktuMenit: number;

	// Fase Sistem
	@Column({ type: "date", nullable: true })
	tanggalMulaiTrial: Date; // 19 Jan 2026

	@Column({ type: "date", nullable: true })
	tanggalSelesaiTrial: Date; // 23 Jan 2026

	@Column({ type: "date", nullable: true })
	tanggalReset: Date; // 24 atau 25 Jan 2026

	@Column({ type: "date", nullable: true })
	tanggalGoLive: Date; // 26 Jan 2026

	@Column({ default: "trial" })
	faseSistem: "trial" | "go_live"; // trial | go_live

	// Flag Sanksi Absen
	@Column({ default: true })
	enableSanksiAbsen: boolean; // Nilai 0 otomatis jika tidak login

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
