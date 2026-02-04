"use client";

import React, { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { SuccessToast, ErrorToast } from "@/components/CommonModals";

interface NilaiSiswa {
	id: number;
	namaSiswa: string;
	kelas: string;
	rataRata: number;
	tertinggi: number;
	terendah: number;
	jumlahTugas: number;
	terselesaikan: number;
}

export default function LaporanPage() {
	const { successToast, showSuccess, closeSuccess } = useNotification();

	const [daftarNilai] = useState<NilaiSiswa[]>([
		{
			id: 1,
			namaSiswa: "Ahmad Ridho",
			kelas: "IX A",
			rataRata: 85,
			tertinggi: 95,
			terendah: 75,
			jumlahTugas: 10,
			terselesaikan: 10,
		},
		{
			id: 2,
			namaSiswa: "Budi Santoso",
			kelas: "IX A",
			rataRata: 78,
			tertinggi: 88,
			terendah: 68,
			jumlahTugas: 10,
			terselesaikan: 9,
		},
		{
			id: 3,
			namaSiswa: "Citra Dewi",
			kelas: "IX A",
			rataRata: 92,
			tertinggi: 98,
			terendah: 85,
			jumlahTugas: 10,
			terselesaikan: 10,
		},
	]);

	const [filterKelas, setFilterKelas] = useState("SEMUA");

	const getGradeColor = (nilai: number) => {
		if (nilai >= 90)
			return "bg-green-100 text-green-800 border-l-4 border-green-500";
		if (nilai >= 80)
			return "bg-blue-100 text-blue-800 border-l-4 border-blue-500";
		if (nilai >= 70)
			return "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500";
		return "bg-red-100 text-red-800 border-l-4 border-red-500";
	};

	const getGradeLabel = (nilai: number) => {
		if (nilai >= 90) return "A (Sangat Baik)";
		if (nilai >= 80) return "B (Baik)";
		if (nilai >= 70) return "C (Cukup)";
		return "D (Kurang)";
	};

	const rataRataKelas = (
		daftarNilai.reduce((sum, item) => sum + item.rataRata, 0) /
		daftarNilai.length
	).toFixed(2);

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">📊 Laporan Nilai</h1>
					<p className="text-gray-600 mt-2">
						Analisis perkembangan belajar siswa
					</p>
				</div>

				{/* Stats Ringkasan */}
				<div className="grid grid-cols-4 gap-4 mb-8">
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
						<p className="text-sm text-gray-600">Total Siswa</p>
						<p className="text-3xl font-bold text-blue-600 mt-2">
							{daftarNilai.length}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
						<p className="text-sm text-gray-600">Rata-Rata Kelas</p>
						<p className="text-3xl font-bold text-green-600 mt-2">
							{rataRataKelas}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
						<p className="text-sm text-gray-600">Nilai Tertinggi</p>
						<p className="text-3xl font-bold text-purple-600 mt-2">
							{Math.max(...daftarNilai.map((n) => n.tertinggi))}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
						<p className="text-sm text-gray-600">Nilai Terendah</p>
						<p className="text-3xl font-bold text-red-600 mt-2">
							{Math.min(...daftarNilai.map((n) => n.terendah))}
						</p>
					</div>
				</div>

				{/* Filter */}
				<div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4">
					<label className="text-sm font-semibold text-gray-700">
						Filter Kelas:
					</label>
					<select
						value={filterKelas}
						onChange={(e) => setFilterKelas(e.target.value)}
						className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
					>
						<option value="SEMUA">Semua Kelas</option>
						<option value="IX A">IX A</option>
						<option value="IX B">IX B</option>
						<option value="IX C">IX C</option>
					</select>
					<button
						onClick={() => showSuccess("Laporan berhasil diunduh!")}
						className="ml-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
					>
						📥 Unduh PDF
					</button>
				</div>

				{/* Tabel Nilai */}
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<table className="w-full">
						<thead className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
							<tr>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									No
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Nama Siswa
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Kelas
								</th>
								<th className="px-6 py-3 text-center text-sm font-semibold">
									Rata-Rata
								</th>
								<th className="px-6 py-3 text-center text-sm font-semibold">
									Tertinggi
								</th>
								<th className="px-6 py-3 text-center text-sm font-semibold">
									Terendah
								</th>
								<th className="px-6 py-3 text-center text-sm font-semibold">
									Tugas
								</th>
								<th className="px-6 py-3 text-center text-sm font-semibold">
									Grade
								</th>
								<th className="px-6 py-3 text-center text-sm font-semibold">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{daftarNilai.map((siswa, idx) => (
								<tr key={siswa.id} className="hover:bg-gray-50 transition-all">
									<td className="px-6 py-4 text-sm font-semibold text-gray-700">
										{idx + 1}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900 font-semibold">
										{siswa.namaSiswa}
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">
										{siswa.kelas}
									</td>
									<td className="px-6 py-4 text-center">
										<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
											{siswa.rataRata}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
											{siswa.tertinggi}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
											{siswa.terendah}
										</span>
									</td>
									<td className="px-6 py-4 text-center text-sm text-gray-700">
										<span className="font-semibold">
											{siswa.terselesaikan}/{siswa.jumlahTugas}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<span
											className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getGradeColor(
												siswa.rataRata,
											)}`}
										>
											{getGradeLabel(siswa.rataRata)}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<button className="text-blue-500 hover:text-blue-700 font-semibold text-sm">
											Detail
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Grafik Perbandingan */}
				<div className="grid grid-cols-2 gap-6 mt-8">
					{/* Distribusi Nilai */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-lg font-bold text-gray-900 mb-4">
							📈 Distribusi Nilai
						</h3>
						<div className="space-y-3">
							{[
								{ label: "A (90-100)", count: 1, color: "bg-green-500" },
								{ label: "B (80-89)", count: 1, color: "bg-blue-500" },
								{ label: "C (70-79)", count: 1, color: "bg-yellow-500" },
								{ label: "D (<70)", count: 0, color: "bg-red-500" },
							].map((item) => (
								<div key={item.label} className="flex items-center gap-3">
									<span className="text-sm font-semibold text-gray-700 w-16">
										{item.label}
									</span>
									<div className="flex-1 bg-gray-200 rounded-full h-6 relative">
										<div
											className={`${item.color} h-6 rounded-full transition-all flex items-center justify-center text-white text-xs font-bold`}
											style={{
												width: `${(item.count / daftarNilai.length) * 100}%`,
											}}
										>
											{item.count > 0 && item.count}
										</div>
									</div>
									<span className="text-sm font-semibold text-gray-700 w-8">
										{item.count}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Tingkat Penyelesaian */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-lg font-bold text-gray-900 mb-4">
							📋 Tingkat Penyelesaian Tugas
						</h3>
						<div className="space-y-4">
							{daftarNilai.map((siswa) => (
								<div key={siswa.id}>
									<div className="flex justify-between mb-1">
										<span className="text-sm font-semibold text-gray-700">
											{siswa.namaSiswa}
										</span>
										<span className="text-sm font-bold text-green-600">
											{Math.round(
												(siswa.terselesaikan / siswa.jumlahTugas) * 100,
											)}
											%
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4">
										<div
											className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all"
											style={{
												width: `${
													(siswa.terselesaikan / siswa.jumlahTugas) * 100
												}%`,
											}}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<SuccessToast
					isOpen={successToast.isOpen}
					message={successToast.message}
					onClose={closeSuccess}
				/>
			</div>
		</div>
	);
}
