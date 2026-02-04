"use client";

import React, { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { SuccessToast, ErrorToast } from "@/components/CommonModals";

interface Soal {
	id: number;
	judul: string;
	kategori: string;
	tipe: "PILIHAN_GANDA" | "ESSAY" | "URAIAN";
	tingkatKesulitan: "MUDAH" | "SEDANG" | "SULIT";
	createdAt: string;
}

export default function BankSoalPage() {
	const { successToast, showSuccess, closeSuccess } = useNotification();

	const [daftarSoal] = useState<Soal[]>([
		{
			id: 1,
			judul: "Definisi persamaan linear satu variabel",
			kategori: "Matematika",
			tipe: "PILIHAN_GANDA",
			tingkatKesulitan: "MUDAH",
			createdAt: "2026-01-28",
		},
		{
			id: 2,
			judul: "Analisis unsur intrinsik cerpen",
			kategori: "Bahasa Indonesia",
			tipe: "ESSAY",
			tingkatKesulitan: "SEDANG",
			createdAt: "2026-01-27",
		},
		{
			id: 3,
			judul: "Sistem persamaan linear dua variabel",
			kategori: "Matematika",
			tipe: "URAIAN",
			tingkatKesulitan: "SULIT",
			createdAt: "2026-01-26",
		},
	]);

	const [showForm, setShowForm] = useState(false);

	const getTipeIcon = (tipe: string) => {
		switch (tipe) {
			case "PILIHAN_GANDA":
				return "⭕";
			case "ESSAY":
				return "📝";
			case "URAIAN":
				return "✍️";
			default:
				return "❓";
		}
	};

	const getTingkatBadge = (tingkat: string) => {
		switch (tingkat) {
			case "MUDAH":
				return "bg-green-100 text-green-800";
			case "SEDANG":
				return "bg-yellow-100 text-yellow-800";
			case "SULIT":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">🏦 Bank Soal</h1>
						<p className="text-gray-600 mt-2">
							Kelola kumpulan soal pembelajaran
						</p>
					</div>
					<button
						onClick={() => setShowForm(!showForm)}
						className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
					>
						+ Tambah Soal
					</button>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-4 gap-4 mb-8">
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
						<p className="text-sm text-gray-600">Total Soal</p>
						<p className="text-3xl font-bold text-blue-600 mt-2">
							{daftarSoal.length}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
						<p className="text-sm text-gray-600">Mudah</p>
						<p className="text-3xl font-bold text-green-600 mt-2">
							{daftarSoal.filter((s) => s.tingkatKesulitan === "MUDAH").length}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
						<p className="text-sm text-gray-600">Sedang</p>
						<p className="text-3xl font-bold text-yellow-600 mt-2">
							{daftarSoal.filter((s) => s.tingkatKesulitan === "SEDANG").length}
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
						<p className="text-sm text-gray-600">Sulit</p>
						<p className="text-3xl font-bold text-red-600 mt-2">
							{daftarSoal.filter((s) => s.tingkatKesulitan === "SULIT").length}
						</p>
					</div>
				</div>

				{/* Form Tambah Soal */}
				{showForm && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-green-500">
						<h3 className="text-xl font-bold text-gray-900 mb-4">
							Tambah Soal Baru
						</h3>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<input
									type="text"
									placeholder="Judul soal"
									className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
									<option>Pilih Kategori</option>
									<option>Matematika</option>
									<option>Bahasa Indonesia</option>
									<option>IPA</option>
									<option>IPS</option>
								</select>
								<select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
									<option>Pilih Tipe</option>
									<option>PILIHAN_GANDA</option>
									<option>ESSAY</option>
									<option>URAIAN</option>
								</select>
								<select className="col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
									<option>Pilih Tingkat Kesulitan</option>
									<option>MUDAH</option>
									<option>SEDANG</option>
									<option>SULIT</option>
								</select>
								<textarea
									placeholder="Deskripsi soal"
									rows={3}
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
									onClick={() => {
										showSuccess("Soal berhasil ditambahkan!");
										setShowForm(false);
									}}
									className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
								>
									Simpan Soal
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Daftar Soal */}
				<div className="space-y-4">
					{daftarSoal.map((soal, idx) => (
						<div
							key={soal.id}
							className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-2xl">{getTipeIcon(soal.tipe)}</span>
										<h3 className="text-lg font-semibold text-gray-900">
											{idx + 1}. {soal.judul}
										</h3>
									</div>
									<div className="flex gap-2 mt-3 flex-wrap">
										<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
											{soal.kategori}
										</span>
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold ${getTingkatBadge(
												soal.tingkatKesulitan,
											)}`}
										>
											{soal.tingkatKesulitan}
										</span>
										<span className="text-xs text-gray-500 py-1">
											{new Date(soal.createdAt).toLocaleDateString("id-ID")}
										</span>
									</div>
								</div>
								<div className="flex gap-2 ml-4">
									<button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all">
										Edit
									</button>
									<button className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all">
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
