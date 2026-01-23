"use client";

import React, { useState } from "react";
import Link from "next/link";

interface JurnalNumerasi {
	nipd: string;
	nama: string;
	senin?: number;
	selasa?: number;
	rabu?: number;
	kamis?: number;
	jumat?: number;
	rataWeek: number;
}

export default function PelaporanNumerasiPage() {
	const [jurnalList] = useState<JurnalNumerasi[]>([
		{
			nipd: "0012345",
			nama: "Andi Wijaya",
			senin: 85,
			selasa: 88,
			rabu: 0,
			kamis: 92,
			jumat: 90,
			rataWeek: 71,
		},
		{
			nipd: "0012346",
			nama: "Budi Santoso",
			senin: 90,
			selasa: 95,
			rabu: 88,
			kamis: 0,
			jumat: 92,
			rataWeek: 73,
		},
		{
			nipd: "0012347",
			nama: "Citra Dewi",
			senin: 0,
			selasa: 0,
			rabu: 0,
			kamis: 0,
			jumat: 0,
			rataWeek: 0,
		},
	]);

	const getScoreColor = (score?: number) => {
		if (!score || score === 0) return "bg-red-100 text-red-800";
		if (score >= 85) return "bg-green-100 text-green-800";
		if (score >= 75) return "bg-yellow-100 text-yellow-800";
		return "bg-orange-100 text-orange-800";
	};

	const topicWeakness = [
		{ topic: "Pembagian", count: 12, percentage: 35 },
		{ topic: "Perkalian", count: 8, percentage: 24 },
		{ topic: "Pengurangan", count: 7, percentage: 21 },
		{ topic: "Penjumlahan", count: 6, percentage: 18 },
	];

	const levelDistribution = [
		{ level: 1, count: 5, percentage: 5 },
		{ level: 2, count: 8, percentage: 9 },
		{ level: 3, count: 15, percentage: 17 },
		{ level: 4, count: 25, percentage: 28 },
		{ level: 5, count: 22, percentage: 24 },
		{ level: 6, count: 10, percentage: 11 },
		{ level: 7, count: 5, percentage: 6 },
	];

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					🧮 Pelaporan Numerasi
				</h1>
				<p className="text-gray-600 text-sm mt-1">
					Analisis hasil berhitung siswa
				</p>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/pelaporan"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						📈 E-Learning
					</Link>
					<Link
						href="/admin/pelaporan/numerasi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						🧮 Numerasi
					</Link>
				</div>
			</div>

			{/* Filter & Actions */}
			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-lg font-bold text-gray-800 mb-4">🔍 Filter</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Kelas
						</label>
						<select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
							<option>Semua Kelas</option>
							<option>5A</option>
							<option>5B</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Minggu
						</label>
						<select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
							<option>Minggu Ini</option>
							<option>Minggu Lalu</option>
							<option>Kustom</option>
						</select>
					</div>
				</div>

				<div className="flex gap-3 mt-4">
					<button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition">
						🔍 Tampilkan
					</button>
					<button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition">
						📊 Analisis
					</button>
				</div>
			</div>

			{/* Statistik Minggu Ini */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
					<p className="text-sm text-gray-600">Siswa Aktif</p>
					<p className="text-3xl font-bold text-blue-600">27/30</p>
				</div>
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
					<p className="text-sm text-gray-600">Tidak Login</p>
					<p className="text-3xl font-bold text-yellow-600">3</p>
				</div>
				<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
					<p className="text-sm text-gray-600">Rata-rata Nilai</p>
					<p className="text-3xl font-bold text-green-600">82</p>
				</div>
				<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
					<p className="text-sm text-gray-600">Naik Level</p>
					<p className="text-3xl font-bold text-purple-600">5</p>
				</div>
			</div>

			{/* Jurnal Harian - Matriks Kalender */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="px-6 py-4 bg-gray-100 border-b-2 border-gray-200">
					<h3 className="font-bold text-gray-800">
						📅 Jurnal Harian Numerasi (Senin-Jumat)
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-100 border-b-2 border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									NIPD
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Nama
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Senin
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Selasa
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Rabu
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Kamis
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Jumat
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Rata-rata Minggu
								</th>
							</tr>
						</thead>
						<tbody>
							{jurnalList.map((item) => (
								<tr
									key={item.nipd}
									className="border-b border-gray-200 hover:bg-gray-50 transition"
								>
									<td className="px-6 py-4 text-sm text-gray-900">
										{item.nipd}
									</td>
									<td className="px-6 py-4 text-sm font-semibold text-gray-900">
										{item.nama}
									</td>
									<td
										className={`px-6 py-4 text-center text-sm font-semibold ${getScoreColor(
											item.senin,
										)}`}
									>
										{item.senin || "-"}
									</td>
									<td
										className={`px-6 py-4 text-center text-sm font-semibold ${getScoreColor(
											item.selasa,
										)}`}
									>
										{item.selasa || "-"}
									</td>
									<td
										className={`px-6 py-4 text-center text-sm font-semibold ${getScoreColor(
											item.rabu,
										)}`}
									>
										{item.rabu || "-"}
									</td>
									<td
										className={`px-6 py-4 text-center text-sm font-semibold ${getScoreColor(
											item.kamis,
										)}`}
									>
										{item.kamis || "-"}
									</td>
									<td
										className={`px-6 py-4 text-center text-sm font-semibold ${getScoreColor(
											item.jumat,
										)}`}
									>
										{item.jumat || "-"}
									</td>
									<td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
										{item.rataWeek > 0 ? item.rataWeek : "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Analisis Grafik */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Kelemahan Topik */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="font-bold text-gray-800 mb-4">📊 Kelemahan Topik</h3>
					<div className="space-y-3">
						{topicWeakness.map((item) => (
							<div key={item.topic}>
								<div className="flex justify-between text-sm mb-1">
									<span className="font-semibold text-gray-700">
										{item.topic}
									</span>
									<span className="text-gray-600">{item.count} siswa</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-red-500 h-2 rounded-full"
										style={{ width: `${item.percentage}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Distribusi Level */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="font-bold text-gray-800 mb-4">
						📈 Distribusi Level Siswa
					</h3>
					<div className="space-y-3">
						{levelDistribution.map((item) => (
							<div key={item.level}>
								<div className="flex justify-between text-sm mb-1">
									<span className="font-semibold text-gray-700">
										Level {item.level}
									</span>
									<span className="text-gray-600">
										{item.count} siswa ({item.percentage}%)
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-blue-500 h-2 rounded-full"
										style={{ width: `${item.percentage}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Export */}
			<div className="flex gap-3">
				<button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold transition">
					📥 Unduh Excel
				</button>
				<button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition">
					🖨️ Cetak Rapor
				</button>
			</div>
		</div>
	);
}
