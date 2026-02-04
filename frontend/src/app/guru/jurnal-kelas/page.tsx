"use client";

import React, { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { SuccessToast, ErrorToast } from "@/components/CommonModals";

interface JurnalEntry {
	id: number;
	tanggal: string;
	topik: string;
	deskripsi: string;
	siswaHadir: number;
	siswaAlpha: number;
	catatan: string;
	createdAt: string;
}

export default function JurnalKelasPage() {
	const { successToast, showSuccess, closeSuccess } = useNotification();

	const [daftarJurnal, setDaftarJurnal] = useState<JurnalEntry[]>([
		{
			id: 1,
			tanggal: "2026-01-28",
			topik: "Persamaan Linear Dua Variabel",
			deskripsi:
				"Siswa mempelajari konsep dasar PLDV dengan metode substitusi dan eliminasi",
			siswaHadir: 28,
			siswaAlpha: 2,
			catatan: "Pembelajaran berjalan lancar, siswa aktif bertanya",
			createdAt: "2026-01-28 08:00",
		},
		{
			id: 2,
			tanggal: "2026-01-27",
			topik: "Unsur Intrinsik Cerpen",
			deskripsi: "Analisis mendalam tentang unsur-unsur dalam karya sastra",
			siswaHadir: 29,
			siswaAlpha: 1,
			catatan: "Diskusi kelas sangat interaktif",
			createdAt: "2026-01-27 08:00",
		},
		{
			id: 3,
			tanggal: "2026-01-26",
			topik: "Fotosintesis",
			deskripsi: "Mempelajari proses fotosintesis pada tumbuhan hijau",
			siswaHadir: 27,
			siswaAlpha: 3,
			catatan: "Ada 3 siswa yang tidak masuk, perlu follow up",
			createdAt: "2026-01-26 08:00",
		},
	]);

	const [showForm, setShowForm] = useState(false);
	const [selectedJurnal, setSelectedJurnal] = useState<JurnalEntry | null>(
		null,
	);

	const totalSiswa = 30;

	const handleAddJurnal = () => {
		showSuccess("Jurnal kelas berhasil ditambahkan!");
		setShowForm(false);
	};

	const handleEditJurnal = (jurnal: JurnalEntry) => {
		setSelectedJurnal(jurnal);
	};

	const handleDeleteJurnal = (id: number) => {
		setDaftarJurnal(daftarJurnal.filter((j) => j.id !== id));
		showSuccess("Jurnal berhasil dihapus!");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							📔 Jurnal Kelas
						</h1>
						<p className="text-gray-600 mt-2">
							Catat aktivitas dan perkembangan kelas
						</p>
					</div>
					<button
						onClick={() => setShowForm(!showForm)}
						className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
					>
						+ Tambah Jurnal
					</button>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-4 gap-4 mb-8">
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
						<p className="text-sm text-gray-600">Total Entri</p>
						<p className="text-3xl font-bold text-blue-600 mt-2">
							{daftarJurnal.length}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
						<p className="text-sm text-gray-600">Rata-Rata Hadir</p>
						<p className="text-3xl font-bold text-green-600 mt-2">
							{(
								daftarJurnal.reduce((sum, j) => sum + j.siswaHadir, 0) /
								daftarJurnal.length
							).toFixed(1)}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
						<p className="text-sm text-gray-600">Rata-Rata Alpha</p>
						<p className="text-3xl font-bold text-red-600 mt-2">
							{(
								daftarJurnal.reduce((sum, j) => sum + j.siswaAlpha, 0) /
								daftarJurnal.length
							).toFixed(1)}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
						<p className="text-sm text-gray-600">Total Siswa</p>
						<p className="text-3xl font-bold text-purple-600 mt-2">
							{totalSiswa}
						</p>
					</div>
				</div>

				{/* Form Tambah Jurnal */}
				{showForm && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-green-500">
						<h3 className="text-xl font-bold text-gray-900 mb-4">
							Tambah Entri Jurnal
						</h3>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<input
									type="date"
									defaultValue={new Date().toISOString().split("T")[0]}
									className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<input
									type="text"
									placeholder="Topik pembelajaran"
									className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<textarea
									placeholder="Deskripsi pembelajaran"
									rows={2}
									className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								></textarea>
								<input
									type="number"
									placeholder="Siswa Hadir"
									defaultValue={30}
									className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<input
									type="number"
									placeholder="Siswa Alpha"
									defaultValue={0}
									className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<textarea
									placeholder="Catatan penting"
									rows={2}
									className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								></textarea>
							</div>
							<div className="flex gap-3 justify-end">
								<button
									onClick={() => setShowForm(false)}
									className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-all"
								>
									Batal
								</button>
								<button
									onClick={handleAddJurnal}
									className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
								>
									Simpan Jurnal
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Modal Edit Detail */}
				{selectedJurnal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							<div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 flex items-center justify-between">
								<h2 className="text-2xl font-bold">Detail Jurnal Kelas</h2>
								<button
									onClick={() => setSelectedJurnal(null)}
									className="text-2xl font-bold hover:opacity-75"
								>
									✕
								</button>
							</div>
							<div className="p-6 space-y-4">
								<div>
									<p className="text-sm text-gray-600">Tanggal</p>
									<p className="text-lg font-semibold text-gray-900">
										{new Date(selectedJurnal.tanggal).toLocaleDateString(
											"id-ID",
											{
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											},
										)}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Topik</p>
									<p className="text-lg font-semibold text-gray-900">
										{selectedJurnal.topik}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Deskripsi</p>
									<p className="text-base text-gray-700 leading-relaxed">
										{selectedJurnal.deskripsi}
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-green-50 rounded-lg p-3">
										<p className="text-sm text-gray-600">Siswa Hadir</p>
										<p className="text-2xl font-bold text-green-600">
											{selectedJurnal.siswaHadir}
										</p>
									</div>
									<div className="bg-red-50 rounded-lg p-3">
										<p className="text-sm text-gray-600">Siswa Alpha</p>
										<p className="text-2xl font-bold text-red-600">
											{selectedJurnal.siswaAlpha}
										</p>
									</div>
								</div>
								<div>
									<p className="text-sm text-gray-600">Catatan</p>
									<p className="text-base text-gray-700 leading-relaxed italic">
										&quot;{selectedJurnal.catatan}&quot;
									</p>
								</div>
								<button
									onClick={() => setSelectedJurnal(null)}
									className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
								>
									Tutup
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Daftar Jurnal */}
				<div className="space-y-4">
					{daftarJurnal.map((jurnal) => (
						<div
							key={jurnal.id}
							className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-l-4 border-green-500"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-2xl">📅</span>
										<h3 className="text-lg font-semibold text-gray-900">
											{new Date(jurnal.tanggal).toLocaleDateString("id-ID", {
												weekday: "long",
												day: "numeric",
												month: "long",
												year: "numeric",
											})}
										</h3>
									</div>
									<h4 className="text-base font-semibold text-green-600 mb-2">
										{jurnal.topik}
									</h4>
									<p className="text-sm text-gray-600 mb-3">
										{jurnal.deskripsi}
									</p>

									<div className="flex gap-4 flex-wrap">
										<div className="bg-green-50 rounded-lg px-3 py-2">
											<p className="text-xs text-gray-600">Siswa Hadir</p>
											<p className="text-lg font-bold text-green-600">
												{jurnal.siswaHadir}/{totalSiswa}
											</p>
										</div>
										<div className="bg-red-50 rounded-lg px-3 py-2">
											<p className="text-xs text-gray-600">Siswa Alpha</p>
											<p className="text-lg font-bold text-red-600">
												{jurnal.siswaAlpha}
											</p>
										</div>
										<div className="bg-blue-50 rounded-lg px-3 py-2">
											<p className="text-xs text-gray-600">
												Persentase Kehadiran
											</p>
											<p className="text-lg font-bold text-blue-600">
												{Math.round((jurnal.siswaHadir / totalSiswa) * 100)}%
											</p>
										</div>
									</div>

									{jurnal.catatan && (
										<div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-2 border-yellow-500">
											<p className="text-xs text-gray-600 uppercase font-semibold">
												📝 Catatan:
											</p>
											<p className="text-sm text-gray-700 italic">
												{jurnal.catatan}
											</p>
										</div>
									)}
								</div>

								<div className="flex gap-2 ml-4">
									<button
										onClick={() => handleEditJurnal(jurnal)}
										className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all"
									>
										Lihat
									</button>
									<button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-all">
										Edit
									</button>
									<button
										onClick={() => handleDeleteJurnal(jurnal.id)}
										className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all"
									>
										Hapus
									</button>
								</div>
							</div>
						</div>
					))}
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
