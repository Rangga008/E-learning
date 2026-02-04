"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { ErrorToast } from "@/components/CommonModals";

interface Tugas {
	id: number;
	judulTugas: string;
	deskripsi: string;
	status: string;
	tipe: "TUGAS" | "KUIS";
	materi?: {
		judulMateri: string;
	};
	tanggalBuka?: string;
	tanggalDeadline?: string;
	createdAt: string;
}

export default function SiwaTugasPage() {
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

	const { errorToast, showError, closeError } = useNotification();

	const [loading, setLoading] = useState(true);
	const [tugas, setTugas] = useState<Tugas[]>([]);
	const [filteredTugas, setFilteredTugas] = useState<Tugas[]>([]);
	const [selectedTipe, setSelectedTipe] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch tugas
	const fetchTugas = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/tugas`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat tugas");
				return;
			}

			const data = await response.json();
			const tugasList = Array.isArray(data) ? data : data.data || [];
			setTugas(tugasList);
			setFilteredTugas(tugasList);
		} catch (error) {
			console.error("Error loading tugas:", error);
			showError("Terjadi kesalahan saat memuat tugas");
		} finally {
			setLoading(false);
		}
	}, [token, showError]);

	useEffect(() => {
		if (token) {
			fetchTugas();
		}
	}, [token, fetchTugas]);

	// Filter tugas
	useEffect(() => {
		let filtered = tugas;

		if (searchTerm) {
			filtered = filtered.filter(
				(t) =>
					t.judulTugas.toLowerCase().includes(searchTerm.toLowerCase()) ||
					t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		if (selectedTipe) {
			filtered = filtered.filter((t) => t.tipe === selectedTipe);
		}

		setFilteredTugas(filtered);
	}, [searchTerm, selectedTipe, tugas]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "OPEN":
				return "bg-green-100 text-green-800";
			case "CLOSED":
				return "bg-red-100 text-red-800";
			case "ONGOING":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Memuat tugas...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* HEADER */}
			<div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900">Tugas & Kuis</h1>
					<p className="text-gray-600">
						Total: {filteredTugas.length} tugas tersedia
					</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 pb-8">
				{/* FILTERS */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								🔍 Cari Tugas
							</label>
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Cari berdasarkan judul..."
								className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								✅ Tipe
							</label>
							<select
								value={selectedTipe}
								onChange={(e) => setSelectedTipe(e.target.value)}
								className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">Semua Tipe</option>
								<option value="TUGAS">Tugas</option>
								<option value="KUIS">Kuis</option>
							</select>
						</div>
					</div>
				</div>

				{/* TUGAS LIST */}
				{filteredTugas.length > 0 ? (
					<div className="space-y-4">
						{filteredTugas.map((t) => (
							<Link
								key={t.id}
								href={`/siswa/tugas/${t.id}`}
								className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="flex justify-between items-start mb-3">
									<div className="flex-1">
										<div className="flex gap-2 mb-2">
											<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
												{t.tipe === "TUGAS" ? "📝 Tugas" : "❓ Kuis"}
											</span>
											<span
												className={`inline-block px-3 py-1 text-xs font-semibold rounded ${getStatusColor(
													t.status,
												)}`}
											>
												{t.status}
											</span>
										</div>
										<h3 className="text-lg font-bold text-gray-900 mb-2">
											{t.judulTugas}
										</h3>
										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											{t.deskripsi}
										</p>
										<div className="text-xs text-gray-500 space-y-1">
											<p>📚 {t.materi?.judulMateri}</p>
											{t.tanggalDeadline && (
												<p className="text-red-600 font-medium">
													⏰ Deadline:{" "}
													{new Date(t.tanggalDeadline).toLocaleDateString(
														"id-ID",
													)}
												</p>
											)}
										</div>
									</div>
									<div className="text-right">
										<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
											Kerjakan →
										</button>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
						<div className="text-4xl mb-3">📋</div>
						<p className="text-gray-500 text-lg">
							Tidak ada tugas yang ditemukan
						</p>
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
