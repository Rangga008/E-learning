"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

export default function GuruDashboard() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);
	const [perluDiperiksa] = useState(12);
	const [absenHariIni] = useState(5);
	const [totalSiswa] = useState(32);
	const [totalMapel] = useState(11);

	const handleLogout = () => {
		authService.logout();
		logout();
		router.push("/");
	};

	const siswaAbsen = [
		{ nisn: "2024001", nama: "Ahmad Rizki" },
		{ nisn: "2024002", nama: "Budi Santoso" },
		{ nisn: "2024005", nama: "Citra Dewi" },
		{ nisn: "2024008", nama: "Diana Putri" },
		{ nisn: "2024012", nama: "Eka Susanti" },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
			{/* Header */}
			<header className="bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg">
				<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<h1 className="text-3xl font-bold">LMS Sanggar Belajar - Guru</h1>
							<p className="text-green-100 text-lg font-semibold">
								📚 Belajar Tanpa Batas
							</p>
							<p className="text-green-100 text-sm mt-1">
								Wali Kelas: VII A | 32 Siswa
							</p>
						</div>
						<div className="flex flex-col items-end gap-2">
							<div className="text-right">
								<p className="font-semibold">{user?.fullName || "Guru"}</p>
								<p className="text-green-100 text-sm">
									ID: {user?.id || "---"}
								</p>
							</div>
							<button
								onClick={handleLogout}
								className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
							>
								🚪 Logout
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
				{/* Priority Widgets */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{/* Perlu Diperiksa - Prioritas Tertinggi */}
					<div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6 border-l-4 border-red-700 hover:shadow-xl transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-red-100 text-sm font-medium">
									📋 PERLU DIPERIKSA
								</p>
								<p className="text-5xl font-bold mt-3">{perluDiperiksa}</p>
								<p className="text-red-100 text-sm mt-2">
									Jawaban esai menunggu penilaian
								</p>
								<Link href="/guru/elearning/koreksi">
									<button className="mt-4 bg-white text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition-all duration-200 hover:scale-105 active:scale-95 w-full">
										✓ Periksa Sekarang
									</button>
								</Link>
							</div>
							<div className="text-6xl opacity-20">📝</div>
						</div>
					</div>

					{/* Jurnal Kelas */}
					<div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 border-l-4 border-orange-700 hover:shadow-xl transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-orange-100 text-sm font-medium">
									📊 JURNAL KELAS HARI INI
								</p>
								<p className="text-5xl font-bold mt-3">{absenHariIni}</p>
								<p className="text-orange-100 text-sm mt-2">
									Siswa absen numerasi (Nilai 0)
								</p>
								<button className="mt-4 bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95 w-full">
									🔍 Lihat Detail
								</button>
							</div>
							<div className="text-6xl opacity-20">👥</div>
						</div>
					</div>

					{/* Statistik Kelas */}
					<div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 border-l-4 border-blue-700 hover:shadow-xl transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-blue-100 text-sm font-medium">
									📈 STATISTIK KELAS
								</p>
								<div className="mt-3 space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-blue-100">Total Siswa:</span>
										<span className="text-2xl font-bold">{totalSiswa}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-blue-100">Mata Pelajaran:</span>
										<span className="text-2xl font-bold">{totalMapel}</span>
									</div>
								</div>
							</div>
							<div className="text-6xl opacity-20">📊</div>
						</div>
					</div>
				</div>

				{/* Daftar Siswa Absen */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
						⚠️ Siswa Absen Numerasi Hari Ini
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b-2 border-gray-300">
									<th className="px-4 py-3 font-semibold text-gray-700">No</th>
									<th className="px-4 py-3 font-semibold text-gray-700">
										NISN
									</th>
									<th className="px-4 py-3 font-semibold text-gray-700">
										Nama Siswa
									</th>
									<th className="px-4 py-3 font-semibold text-gray-700">
										Nilai
									</th>
									<th className="px-4 py-3 font-semibold text-gray-700">
										Status
									</th>
								</tr>
							</thead>
							<tbody>
								{siswaAbsen.map((siswa, idx) => (
									<tr
										key={idx}
										className="border-b border-gray-200 hover:bg-red-50 transition-colors"
									>
										<td className="px-4 py-3 text-gray-700">{idx + 1}</td>
										<td className="px-4 py-3 text-gray-700 font-mono">
											{siswa.nisn}
										</td>
										<td className="px-4 py-3 text-gray-700">{siswa.nama}</td>
										<td className="px-4 py-3 font-bold text-red-600 text-lg">
											0
										</td>
										<td className="px-4 py-3">
											<span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
												Absen
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Quick Access Buttons */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
					<Link href="/guru/elearning/materi">
						<button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-4">
							<div className="text-4xl">➕</div>
							<div className="text-left">
								<p className="font-bold text-lg">Tambah Materi Baru</p>
								<p className="text-purple-100 text-sm">E-Learning & Tugas</p>
							</div>
						</button>
					</Link>
					<Link href="/guru/berhitung/soal">
						<button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-4">
							<div className="text-4xl">🔢</div>
							<div className="text-left">
								<p className="font-bold text-lg">Input Soal Numerasi</p>
								<p className="text-indigo-100 text-sm">Bank Soal Berhitung</p>
							</div>
						</button>
					</Link>
				</div>

				{/* Main Menu - E-Learning & Berhitung */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* E-Learning Menu */}
					<div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
						<h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
							📚 E-Learning (KBM Reguler)
						</h2>
						<div className="space-y-3">
							<Link href="/guru/elearning/mapel">
								<div className="p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 hover:scale-102 transition-all duration-200">
									<p className="font-semibold text-gray-800">
										📖 Mata Pelajaran
									</p>
									<p className="text-sm text-gray-600">
										Kelola daftar mapel: {totalMapel} mapel
									</p>
								</div>
							</Link>
							<Link href="/guru/elearning/materi">
								<div className="p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 hover:scale-102 transition-all duration-200">
									<p className="font-semibold text-gray-800">
										📝 Materi & Tugas
									</p>
									<p className="text-sm text-gray-600">
										Posting materi dan soal uraian
									</p>
								</div>
							</Link>
							<Link href="/guru/elearning/koreksi">
								<div className="p-4 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 hover:scale-102 transition-all duration-200 border-4 border-red-400 bg-red-50">
									<p className="font-semibold text-gray-800">
										✍️ Koreksi Jawaban
									</p>
									<p className="text-sm text-red-600">
										<strong>{perluDiperiksa} jawaban menunggu penilaian</strong>
									</p>
								</div>
							</Link>
							<Link href="/guru/pelaporan/elearning">
								<div className="p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 hover:scale-102 transition-all duration-200">
									<p className="font-semibold text-gray-800">
										📊 Laporan E-Learning
									</p>
									<p className="text-sm text-gray-600">
										Analisis nilai dan ketuntasan
									</p>
								</div>
							</Link>
						</div>
					</div>

					{/* Berhitung (Numerasi) Menu */}
					<div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
						<h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
							🧮 Berhitung (Numerasi)
						</h2>
						<div className="space-y-3">
							<Link href="/guru/berhitung/setting">
								<div className="p-4 border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:scale-102 transition-all duration-200">
									<p className="font-semibold text-gray-800">
										⚙️ Pengaturan Level
									</p>
									<p className="text-sm text-gray-600">
										Aturan waktu, topik, dan KKM
									</p>
								</div>
							</Link>
							<Link href="/guru/berhitung/soal">
								<div className="p-4 border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:scale-102 transition-all duration-200">
									<p className="font-semibold text-gray-800">🏦 Bank Soal</p>
									<p className="text-sm text-gray-600">
										Kelola soal numerasi per topik
									</p>
								</div>
							</Link>
							<Link href="/guru/pelaporan/numerasi">
								<div className="p-4 border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:scale-102 transition-all duration-200">
									<p className="font-semibold text-gray-800">
										📈 Laporan Numerasi
									</p>
									<p className="text-sm text-gray-600">
										Rekap nilai, jurnal, analisis siswa
									</p>
								</div>
							</Link>
							<Link href="/guru/berhitung/analisis">
								<div className="p-4 border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:scale-102 transition-all duration-200">
									<p className="font-semibold text-gray-800">
										🎯 Analisis Siswa
									</p>
									<p className="text-sm text-gray-600">
										Kelemahan topik per siswa
									</p>
								</div>
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
