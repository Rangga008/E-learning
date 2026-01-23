"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SuccessToast } from "@/components/CommonModals";
import { useNotification } from "@/hooks/useNotification";

interface JawabanEsai {
	id: number;
	nipd: string;
	nama: string;
	mapel: string;
	materi: string;
	status: "pending" | "dinilai";
	nilai?: number;
}

export default function KoreksiPage() {
	const { successToast, closeSuccess, showSuccess } = useNotification();
	const [daftarJawaban] = useState<JawabanEsai[]>([
		{
			id: 1,
			nipd: "0012345",
			nama: "Andi Wijaya",
			mapel: "Matematika",
			materi: "Persamaan Linear",
			status: "pending",
		},
		{
			id: 2,
			nipd: "0012346",
			nama: "Budi Santoso",
			mapel: "Bahasa Indonesia",
			materi: "Analisis Cerpen",
			status: "dinilai",
			nilai: 85,
		},
		{
			id: 3,
			nipd: "0012347",
			nama: "Citra Dewi",
			mapel: "Matematika",
			materi: "Persamaan Linear",
			status: "pending",
		},
	]);

	const [selectedJawaban, setSelectedJawaban] = useState<JawabanEsai | null>(
		null,
	);
	const [nilaiInput, setNilaiInput] = useState("");
	const [showDetailModal, setShowDetailModal] = useState(false);

	const handleBukaTugas = (jawaban: JawabanEsai) => {
		setSelectedJawaban(jawaban);
		setNilaiInput(jawaban.nilai?.toString() || "");
		setShowDetailModal(true);
	};

	const handleSimpanNilai = () => {
		// Handle save logic
		setShowDetailModal(false);
		showSuccess("Nilai tersimpan!");
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					✅ Koreksi Jawaban Esai
				</h1>
				<p className="text-gray-600 text-sm mt-1">
					Periksa dan nilai jawaban uraian siswa
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
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-transparent hover:bg-gray-50"
					>
						📝 Materi & Tugas
					</Link>
					<Link
						href="/admin/elearning/koreksi"
						className="px-6 py-4 text-gray-700 font-semibold border-b-4 border-blue-600 hover:bg-gray-50"
					>
						✅ Koreksi Jawaban
					</Link>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-4">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<p className="text-sm text-gray-600">Menunggu Penilaian</p>
					<p className="text-3xl font-bold text-yellow-600">
						{daftarJawaban.filter((j) => j.status === "pending").length}
					</p>
				</div>
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<p className="text-sm text-gray-600">Sudah Dinilai</p>
					<p className="text-3xl font-bold text-green-600">
						{daftarJawaban.filter((j) => j.status === "dinilai").length}
					</p>
				</div>
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p className="text-sm text-gray-600">Total Jawaban</p>
					<p className="text-3xl font-bold text-blue-600">
						{daftarJawaban.length}
					</p>
				</div>
			</div>

			{/* Daftar Jawaban */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-100 border-b-2 border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									No
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									NIPD
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Nama
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Mata Pelajaran
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
									Materi
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Status
								</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
									Aksi
								</th>
							</tr>
						</thead>
						<tbody>
							{daftarJawaban.map((jawaban, index) => (
								<tr
									key={jawaban.id}
									className="border-b border-gray-200 hover:bg-gray-50 transition"
								>
									<td className="px-6 py-4 text-sm text-gray-900">
										{index + 1}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900">
										{jawaban.nipd}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900">
										{jawaban.nama}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900">
										{jawaban.mapel}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900">
										{jawaban.materi}
									</td>
									<td className="px-6 py-4 text-center">
										{jawaban.status === "pending" ? (
											<span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
												Menunggu
											</span>
										) : (
											<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
												Dinilai ({jawaban.nilai})
											</span>
										)}
									</td>
									<td className="px-6 py-4 text-center">
										<button
											onClick={() => handleBukaTugas(jawaban)}
											className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
										>
											🔍 Periksa
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Detail Modal */}
			{showDetailModal && selectedJawaban && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							🔍 Periksa Jawaban
						</h2>

						{/* Student Info */}
						<div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-600">Nama Siswa</p>
								<p className="font-semibold text-gray-900">
									{selectedJawaban.nama}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">NIPD</p>
								<p className="font-semibold text-gray-900">
									{selectedJawaban.nipd}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Mata Pelajaran</p>
								<p className="font-semibold text-gray-900">
									{selectedJawaban.mapel}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Materi</p>
								<p className="font-semibold text-gray-900">
									{selectedJawaban.materi}
								</p>
							</div>
						</div>

						{/* Jawaban Siswa */}
						<div className="mb-6">
							<h3 className="font-bold text-gray-800 mb-2">
								📝 Jawaban Siswa:
							</h3>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-800">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua...
							</div>
						</div>

						{/* Nilai */}
						<div className="mb-6">
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Masukkan Nilai (0-100) *
							</label>
							<div className="flex gap-2">
								<input
									type="number"
									min="0"
									max="100"
									value={nilaiInput}
									onChange={(e) => setNilaiInput(e.target.value)}
									className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
									placeholder="Contoh: 85"
								/>
								<div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 font-bold text-gray-900">
									{nilaiInput ? nilaiInput : "-"}
								</div>
							</div>
						</div>

						{/* Catatan */}
						<div className="mb-6">
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Catatan / Feedback
							</label>
							<textarea
								placeholder="Berikan umpan balik kepada siswa..."
								className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
								rows={3}
							></textarea>
						</div>

						{/* Actions */}
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setShowDetailModal(false)}
								className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
							>
								Batal
							</button>
							<button
								onClick={handleSimpanNilai}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
							>
								✅ Simpan Nilai
							</button>
						</div>
					</div>
				</div>
			)}

			<SuccessToast
				isOpen={successToast.isOpen}
				message={successToast.message}
				onClose={closeSuccess}
			/>
		</div>
	);
}
