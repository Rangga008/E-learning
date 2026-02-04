"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { ErrorToast } from "@/components/CommonModals";

interface NilaiTugas {
	id: number;
	tugas: {
		judulTugas: string;
		tipe: "TUGAS" | "KUIS";
		materi: {
			judulMateri: string;
		};
	};
	nilai: number;
	feedback?: string;
	createdAt: string;
}

interface StatisticNilai {
	total: number;
	rata: number;
	tertinggi: number;
	terendah: number;
}

export default function SiswaNilaiPage() {
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

	const { errorToast, showError, closeError } = useNotification();

	const [loading, setLoading] = useState(true);
	const [nilaiList, setNilaiList] = useState<NilaiTugas[]>([]);
	const [statistik, setStatistik] = useState<StatisticNilai>({
		total: 0,
		rata: 0,
		tertinggi: 0,
		terendah: 0,
	});
	const [filterType, setFilterType] = useState<string>("");

	// Fetch nilai
	const fetchNilai = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/nilai`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat nilai");
				return;
			}

			const data = await response.json();
			const list = Array.isArray(data) ? data : data.data || [];
			setNilaiList(list);

			// Calculate statistics
			if (list.length > 0) {
				const nilaiValues = list.map((n: NilaiTugas) => n.nilai);
				const total = nilaiValues.length;
				const rata =
					nilaiValues.reduce((a: number, b: number) => a + b, 0) / total;
				const tertinggi = Math.max(...nilaiValues);
				const terendah = Math.min(...nilaiValues);

				setStatistik({ total, rata, tertinggi, terendah });
			}
		} catch (error) {
			console.error("Error loading nilai:", error);
			showError("Terjadi kesalahan saat memuat nilai");
		} finally {
			setLoading(false);
		}
	}, [token, showError]);

	useEffect(() => {
		if (token) {
			fetchNilai();
		}
	}, [token, fetchNilai]);

	const filteredNilai = filterType
		? nilaiList.filter((n) => n.tugas.tipe === filterType)
		: nilaiList;

	const getNilaiColor = (nilai: number) => {
		if (nilai >= 85) return "text-green-600";
		if (nilai >= 70) return "text-yellow-600";
		return "text-red-600";
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Memuat nilai...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* HEADER */}
			<div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900">Nilai Saya</h1>
					<p className="text-gray-600">Lihat hasil tugas dan kuis Anda</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 pb-8">
				{/* STATISTICS */}
				{statistik.total > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<p className="text-sm text-gray-600">Total Penilaian</p>
							<p className="text-3xl font-bold text-blue-600">
								{statistik.total}
							</p>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<p className="text-sm text-gray-600">Rata-rata</p>
							<p
								className={`text-3xl font-bold ${getNilaiColor(
									statistik.rata,
								)}`}
							>
								{statistik.rata.toFixed(2)}
							</p>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<p className="text-sm text-gray-600">Tertinggi</p>
							<p className="text-3xl font-bold text-green-600">
								{statistik.tertinggi}
							</p>
						</div>

						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<p className="text-sm text-gray-600">Terendah</p>
							<p className="text-3xl font-bold text-red-600">
								{statistik.terendah}
							</p>
						</div>
					</div>
				)}

				{/* FILTER */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Filter Tipe
					</label>
					<div className="flex gap-3">
						<button
							onClick={() => setFilterType("")}
							className={`px-4 py-2 rounded-lg transition-colors ${
								filterType === ""
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							Semua
						</button>
						<button
							onClick={() => setFilterType("TUGAS")}
							className={`px-4 py-2 rounded-lg transition-colors ${
								filterType === "TUGAS"
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							📝 Tugas
						</button>
						<button
							onClick={() => setFilterType("KUIS")}
							className={`px-4 py-2 rounded-lg transition-colors ${
								filterType === "KUIS"
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							❓ Kuis
						</button>
					</div>
				</div>

				{/* NILAI LIST */}
				{filteredNilai.length > 0 ? (
					<div className="space-y-4">
						{filteredNilai.map((n) => (
							<div
								key={n.id}
								className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-3">
									<div className="flex-1">
										<div className="flex gap-2 mb-2">
											<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
												{n.tugas.tipe === "TUGAS" ? "📝 Tugas" : "❓ Kuis"}
											</span>
										</div>
										<h3 className="text-lg font-bold text-gray-900 mb-1">
											{n.tugas.judulTugas}
										</h3>
										<p className="text-sm text-gray-600 mb-2">
											📚 {n.tugas.materi.judulMateri}
										</p>
										{n.feedback && (
											<div className="bg-gray-50 rounded p-3 mb-2">
												<p className="text-xs font-semibold text-gray-700 mb-1">
													Feedback:
												</p>
												<p className="text-sm text-gray-600">{n.feedback}</p>
											</div>
										)}
										<p className="text-xs text-gray-400">
											📅 {new Date(n.createdAt).toLocaleDateString("id-ID")}
										</p>
									</div>
									<div className="text-right">
										<p
											className={`text-4xl font-bold ${getNilaiColor(n.nilai)}`}
										>
											{n.nilai}
										</p>
										<p className="text-sm text-gray-600">dari 100</p>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
						<div className="text-4xl mb-3">📊</div>
						<p className="text-gray-500 text-lg">Belum ada nilai</p>
					</div>
				)}
			</div>

			{/* TOASTS */}
			{errorToast.isOpen && (
				<ErrorToast
					isOpen={errorToast.isOpen}
					message={errorToast.message}
					onClose={closeError}
				/>
			)}
		</div>
	);
}
