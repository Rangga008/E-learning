"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { ErrorToast } from "@/components/CommonModals";

interface Numerasi {
	id: number;
	judul: string;
	deskripsi: string;
	tingkatan: "MUDAH" | "SEDANG" | "SULIT";
	tipe: "PENJUMLAHAN" | "PENGURANGAN" | "PERKALIAN" | "PEMBAGIAN" | "CAMPURAN";
	waktuLimit: number; // dalam menit
	soalCount: number;
	nilaiSiswa?: number;
}

export default function SiswaBerhitungPage() {
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

	const { errorToast, showError, closeError } = useNotification();

	const [loading, setLoading] = useState(true);
	const [numerasiList, setNumerasiList] = useState<Numerasi[]>([]);
	const [selectedTingkat, setSelectedTingkat] = useState<string>("MUDAH");

	// Mock data for numerasi
	const mockNumerasi: Numerasi[] = [
		{
			id: 1,
			judul: "Penjumlahan Dasar",
			deskripsi: "Latihan penjumlahan angka 1-10",
			tingkatan: "MUDAH",
			tipe: "PENJUMLAHAN",
			waktuLimit: 5,
			soalCount: 10,
		},
		{
			id: 2,
			judul: "Pengurangan Dasar",
			deskripsi: "Latihan pengurangan angka 1-20",
			tingkatan: "MUDAH",
			tipe: "PENGURANGAN",
			waktuLimit: 5,
			soalCount: 10,
		},
		{
			id: 3,
			judul: "Perkalian 1-5",
			deskripsi: "Latihan perkalian dengan angka 1-5",
			tingkatan: "SEDANG",
			tipe: "PERKALIAN",
			waktuLimit: 10,
			soalCount: 15,
		},
		{
			id: 4,
			judul: "Pembagian Sedang",
			deskripsi: "Latihan pembagian bilangan bulat",
			tingkatan: "SEDANG",
			tipe: "PEMBAGIAN",
			waktuLimit: 10,
			soalCount: 12,
		},
		{
			id: 5,
			judul: "Operasi Campuran Lanjut",
			deskripsi: "Latihan kombinasi semua operasi",
			tingkatan: "SULIT",
			tipe: "CAMPURAN",
			waktuLimit: 15,
			soalCount: 20,
		},
	];

	useEffect(() => {
		// Simulate loading
		setLoading(false);
		setNumerasiList(mockNumerasi);
	}, []);

	const getTingkatColor = (tingkat: string) => {
		switch (tingkat) {
			case "MUDAH":
				return "bg-green-100 text-green-700 border-green-300";
			case "SEDANG":
				return "bg-yellow-100 text-yellow-700 border-yellow-300";
			case "SULIT":
				return "bg-red-100 text-red-700 border-red-300";
			default:
				return "bg-gray-100 text-gray-700 border-gray-300";
		}
	};

	const getTipeIcon = (tipe: string) => {
		switch (tipe) {
			case "PENJUMLAHAN":
				return "➕";
			case "PENGURANGAN":
				return "➖";
			case "PERKALIAN":
				return "✖️";
			case "PEMBAGIAN":
				return "➗";
			case "CAMPURAN":
				return "🔢";
			default:
				return "🧮";
		}
	};

	const filteredNumerasi = numerasiList.filter(
		(n) => selectedTingkat === "" || n.tingkatan === selectedTingkat,
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
						🧮 Berhitung (Numerasi)
					</h1>
					<p className="text-gray-600 mt-2">
						Latih kemampuan hitung dengan berbagai tingkat kesulitan
					</p>
				</div>

				{/* Error Toast */}
				<ErrorToast
					isOpen={errorToast.isOpen}
					message={errorToast.message}
					onClose={closeError}
				/>

				{/* Filter Tingkat */}
				<div className="mb-8 flex gap-3 flex-wrap">
					<button
						onClick={() => setSelectedTingkat("")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedTingkat === ""
								? "bg-purple-600 text-white"
								: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
						}`}
					>
						Semua Tingkat
					</button>
					<button
						onClick={() => setSelectedTingkat("MUDAH")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedTingkat === "MUDAH"
								? "bg-green-600 text-white"
								: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
						}`}
					>
						Mudah
					</button>
					<button
						onClick={() => setSelectedTingkat("SEDANG")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedTingkat === "SEDANG"
								? "bg-yellow-600 text-white"
								: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
						}`}
					>
						Sedang
					</button>
					<button
						onClick={() => setSelectedTingkat("SULIT")}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							selectedTingkat === "SULIT"
								? "bg-red-600 text-white"
								: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
						}`}
					>
						Sulit
					</button>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
					</div>
				)}

				{/* Grid Cards */}
				{!loading && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{filteredNumerasi.map((numerasi) => (
							<Link
								key={numerasi.id}
								href={`/siswa/berhitung/${numerasi.id}`}
								className="group"
							>
								<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full hover:scale-105 transform cursor-pointer border border-gray-100">
									{/* Header */}
									<div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h3 className="text-xl font-bold">{numerasi.judul}</h3>
												<p className="text-yellow-100 text-sm mt-1">
													{numerasi.deskripsi}
												</p>
											</div>
											<div className="text-4xl">
												{getTipeIcon(numerasi.tipe)}
											</div>
										</div>
									</div>

									{/* Content */}
									<div className="p-6">
										{/* Stats Row 1 */}
										<div className="grid grid-cols-2 gap-4 mb-4">
											{/* Tingkat */}
											<div>
												<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
													Tingkat
												</p>
												<span
													className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getTingkatColor(
														numerasi.tingkatan,
													)}`}
												>
													{numerasi.tingkatan}
												</span>
											</div>

											{/* Waktu */}
											<div>
												<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
													Waktu Limit
												</p>
												<div className="text-xl font-bold text-blue-600">
													⏱️ {numerasi.waktuLimit} menit
												</div>
											</div>
										</div>

										{/* Stats Row 2 */}
										<div className="mb-4">
											<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
												Jumlah Soal
											</p>
											<div className="text-lg font-semibold text-orange-600">
												{numerasi.soalCount} soal
											</div>
										</div>

										{/* Button */}
										<button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 group-hover:shadow-lg">
											Mulai Latihan
										</button>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}

				{/* Empty State */}
				{!loading && filteredNumerasi.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-400 text-6xl mb-4">📊</div>
						<h3 className="text-xl font-semibold text-gray-900">
							Belum ada latihan
						</h3>
						<p className="text-gray-600 mt-2">
							Silakan pilih tingkat kesulitan lain
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
