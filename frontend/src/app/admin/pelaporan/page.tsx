"use client";

import React, { useState } from "react";
import Link from "next/link";

interface RekapData {
	kelas: string;
	mapel: string;
	rata: number;
	tuntas: number;
	tidakTuntas: number;
}

export default function PelaporanPage() {
	const [rekapList] = useState<RekapData[]>([
		{
			kelas: "5A",
			mapel: "Matematika",
			rata: 78,
			tuntas: 28,
			tidakTuntas: 2,
		},
		{
			kelas: "5A",
			mapel: "Bahasa Indonesia",
			rata: 82,
			tuntas: 29,
			tidakTuntas: 1,
		},
		{
			kelas: "5B",
			mapel: "Matematika",
			rata: 75,
			tuntas: 26,
			tidakTuntas: 4,
		},
	]);

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					📊 Pelaporan & Evaluasi
				</h1>
				<p className="text-gray-600 text-sm mt-1">
					Analisis hasil pembelajaran dan numerasi
				</p>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/pelaporan"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						📈 E-Learning
					</Link>
					<Link
						href="/admin/pelaporan/numerasi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						🧮 Numerasi
					</Link>
				</div>
			</div>

			{/* Filter */}
			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-lg font-bold text-gray-800 mb-4">🔍 Filter</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Kelas
						</label>
						<select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
							<option>Semua Kelas</option>
							<option>5A</option>
							<option>5B</option>
							<option>5C</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Mata Pelajaran
						</label>
						<select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
							<option>Semua Mapel</option>
							<option>Matematika</option>
							<option>Bahasa Indonesia</option>
							<option>IPAS</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Periode
						</label>
						<select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
							<option>Bulan Ini</option>
							<option>Minggu Ini</option>
							<option>Hari Ini</option>
							<option>Kustom</option>
						</select>
					</div>
				</div>

				<button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition">
					🔍 Tampilkan
				</button>
			</div>

			{/* Statistik Ketuntasan */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
					<p className="text-sm text-gray-600 mb-2">Rata-rata Ketuntasan</p>
					<p className="text-4xl font-bold text-green-600">78.3%</p>
					<p className="text-xs text-gray-600 mt-2">Di atas target 75%</p>
				</div>

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
					<p className="text-sm text-gray-600 mb-2">Siswa Tuntas</p>
					<p className="text-4xl font-bold text-blue-600">83/90</p>
					<p className="text-xs text-gray-600 mt-2">92.2% dari total</p>
				</div>

				<div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
					<p className="text-sm text-gray-600 mb-2">Siswa Tidak Tuntas</p>
					<p className="text-4xl font-bold text-orange-600">7/90</p>
					<p className="text-xs text-gray-600 mt-2">Perlu remediasi</p>
				</div>
			</div>

			{/* Tabel Rekap */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="px-6 py-4 bg-gray-100 border-b-2 border-gray-200">
					<h3 className="font-bold text-gray-800">
						📋 Rekap Nilai per Kelas & Mapel
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-100 border-b-2 border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Kelas
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Mata Pelajaran
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Rata-rata
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Tuntas
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Tidak Tuntas
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									% Tuntas
								</th>
							</tr>
						</thead>
						<tbody>
							{rekapList.map((item, index) => {
								const pctTuntas = Math.round(
									(item.tuntas / (item.tuntas + item.tidakTuntas)) * 100,
								);
								return (
									<tr
										key={index}
										className="border-b border-gray-200 hover:bg-gray-50 transition"
									>
										<td className="px-6 py-4 text-sm font-semibold text-gray-900">
											{item.kelas}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{item.mapel}
										</td>
										<td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
											{item.rata}
										</td>
										<td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">
											{item.tuntas}
										</td>
										<td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">
											{item.tidakTuntas}
										</td>
										<td className="px-6 py-4 text-center">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													pctTuntas >= 75
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{pctTuntas}%
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Export */}
			<div className="flex gap-3">
				<button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold transition">
					📥 Unduh Excel
				</button>
				<button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition">
					🖨️ Cetak
				</button>
			</div>
		</div>
	);
}
