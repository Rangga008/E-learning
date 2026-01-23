"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Soal {
	id: number;
	kategori: string;
	soal: string;
	jawaban: string;
}

export default function BankSoalPage() {
	const [soalList, setSoalList] = useState<Soal[]>([
		{
			id: 1,
			kategori: "Penjumlahan Tingkat 1",
			soal: "25 + 13 = ?",
			jawaban: "38",
		},
		{
			id: 2,
			kategori: "Pengurangan Tingkat 1",
			soal: "50 - 23 = ?",
			jawaban: "27",
		},
		{
			id: 3,
			kategori: "Perkalian Tingkat 2",
			soal: "12 × 8 = ?",
			jawaban: "96",
		},
	]);

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					📚 Bank Soal Numerasi
				</h1>
				<p className="text-gray-600 text-sm mt-1">Kelola soal-soal berhitung</p>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/numerasi/banksoal"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						📚 Bank Soal
					</Link>
				</div>
			</div>

			{/* Aksi */}
			<div className="space-y-3">
				<button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition">
					➕ Tambah Soal
				</button>
				<button className="ml-3 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition">
					📥 Impor dari Excel
				</button>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-3 gap-4">
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p className="text-sm text-gray-600">Total Soal</p>
					<p className="text-3xl font-bold text-blue-600">{soalList.length}</p>
				</div>
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<p className="text-sm text-gray-600">Kategori</p>
					<p className="text-3xl font-bold text-green-600">3</p>
				</div>
				<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
					<p className="text-sm text-gray-600">Status</p>
					<p className="text-3xl font-bold text-purple-600">✓</p>
				</div>
			</div>

			{/* Soal List */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-100 border-b-2 border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									No
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Kategori
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Soal
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Jawaban
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody>
							{soalList.map((soal, index) => (
								<tr
									key={soal.id}
									className="border-b border-gray-200 hover:bg-gray-50 transition"
								>
									<td className="px-6 py-4 text-sm text-gray-900">
										{index + 1}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900">
										<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
											{soal.kategori}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-900">
										{soal.soal}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900 font-semibold">
										{soal.jawaban}
									</td>
									<td className="px-6 py-4 text-center space-x-2">
										<button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition">
											✏️ Edit
										</button>
										<button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">
											🗑️ Hapus
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
