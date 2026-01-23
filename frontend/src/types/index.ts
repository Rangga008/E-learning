"use client";

export type UserRole = "siswa" | "guru" | "admin";

export interface User {
	id: number;
	username: string;
	email: string;
	fullName: string;
	role: UserRole;
	isActive: boolean;
}

export interface PesertaDidik {
	id: number;
	nipd: string;
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	kelas: string;
	level: number;
	poin: number;
}

export interface Guru {
	id: number;
	nip: string;
	namaLengkap: string;
	kelasWali: string;
	kelasMapel: string[];
}

export interface MataPelajaran {
	id: number;
	nama: string;
	deskripsi?: string;
}

export interface Materi {
	id: number;
	mataPelajaranId: number;
	materiPokok: string;
	konten: string;
	tanggalPosting: Date;
}

export interface SoalEsai {
	id: number;
	materiId: number;
	pertanyaan: string;
	bobot?: number;
}

export interface JawabanEsai {
	id: number;
	pesertaDidikId: number;
	soalEsaiId: number;
	jawaban: string;
	nilai?: number;
	sudahDinilai: boolean;
	catatanGuru?: string;
}

export interface SoalNumerasi {
	id: number;
	kategori: string;
	soal: string;
	jawaban: number;
	level?: number;
}

export interface JawabanNumerasi {
	id: number;
	pesertaDidikId: number;
	tanggal: Date;
	topik: string;
	level: number;
	jumlahBenar: number;
	jumlahSalah: number;
	nilai?: number;
	waktuMulai?: Date;
	waktuSelesai?: Date;
	sudahSelesai: boolean;
	naik_level: boolean;
}
