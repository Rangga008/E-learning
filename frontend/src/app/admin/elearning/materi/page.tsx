"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Material {
	id: number;
	mapel: string;
	pokok: string;
	konten: string;
	tanggalPosting: string;
	jumlahSoal: number;
}

export default function MateriPage() {
	const [materiList, setMateriList] = useState<Material[]>([
		{
			id: 1,
			mapel: "Matematika",
			pokok: "Persamaan Linear",
			konten: "Materi tentang persamaan linear dua variabel",
			tanggalPosting: "2026-01-18",
			jumlahSoal: 5,
		},
		{
			id: 2,
			mapel: "Bahasa Indonesia",
			pokok: "Analisis Cerpen",
			konten: "Materi tentang cara menganalisis cerpen dengan baik",
			tanggalPosting: "2026-01-17",
			jumlahSoal: 3,
		},
	]);

	const [showFormSoal, setShowFormSoal] = useState(false);
	const [selectedMateriId, setSelectedMateriId] = useState<number | null>(null);

	const handleTambahSoal = (materiId: number) => {
		setSelectedMateriId(materiId);
		setShowFormSoal(true);
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">📝 Materi & Tugas</h1>
				<p className="text-gray-600 text-sm mt-1">
					Kelola materi pembelajaran dan soal uraian
				</p>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow mb-6 border-b-2 border-gray-200">
				<div className="flex flex-wrap">
					<Link
						href="/admin/elearning"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						📖 Mata Pelajaran
					</Link>
					<Link
						href="/admin/elearning/materi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						📝 Materi & Tugas
					</Link>
					<Link
						href="/admin/elearning/koreksi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						✅ Koreksi Jawaban
					</Link>
				</div>
			</div>

			{/* Add Button */}
			<button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition">
				➕ Tambah Materi Baru
			</button>

			{/* Materi List */}
			<div className="space-y-4">
				{materiList.map((materi) => (
					<div
						key={materi.id}
						className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
					>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
							<div>
								<p className="text-sm text-gray-600">Mata Pelajaran</p>
								<p className="font-semibold text-gray-900">{materi.mapel}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Pokok Bahasan</p>
								<p className="font-semibold text-gray-900">{materi.pokok}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Tanggal Posting</p>
								<p className="font-semibold text-gray-900">
									{new Date(materi.tanggalPosting).toLocaleDateString("id-ID")}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Jumlah Soal</p>
								<p className="font-semibold text-gray-900">
									{materi.jumlahSoal} soal
								</p>
							</div>
						</div>

						<p className="text-gray-700 mb-4">{materi.konten}</p>

						<div className="flex flex-wrap gap-3">
							<button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition">
								✏️ Edit
							</button>
							<button
								onClick={() => handleTambahSoal(materi.id)}
								className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
							>
								➕ Tambah Soal
							</button>
							<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
								🗑️ Hapus
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Form Input Soal - Modal */}
			{showFormSoal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-96 overflow-y-auto">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							➕ Input Soal Uraian
						</h2>

						<form className="space-y-4">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Soal *
								</label>
								<textarea
									placeholder="Masukkan pertanyaan soal uraian..."
									className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
									rows={4}
								></textarea>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Kunci Jawaban / Rubrik *
								</label>
								<textarea
									placeholder="Masukkan kunci jawaban atau rubrik penilaian..."
									className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
									rows={3}
								></textarea>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Bobot / Poin *
								</label>
								<input
									type="number"
									placeholder="Contoh: 10"
									className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
								/>
							</div>

							<div className="flex gap-3 justify-end">
								<button
									type="button"
									onClick={() => setShowFormSoal(false)}
									className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
								>
									Batal
								</button>
								<button
									type="submit"
									className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
								>
									Simpan Soal
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
