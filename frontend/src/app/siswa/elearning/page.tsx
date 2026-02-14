"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { ErrorToast } from "@/components/CommonModals";

interface MapelCard {
	id: number;
	nama: string;
	guru_nama: string;
	materi_count: number;
	tugas_count: number;
}

interface Materi {
	id: number;
	judulMateri: string;
	deskripsi: string;
	mataPelajaranId: number;
}

interface Tugas {
	id: number;
	judulTugas: string;
	mataPelajaranId: number;
}

export default function SiswaElearningPage() {
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);
	const isLoading = useAuthStore((state) => state.isLoading);

	const { errorToast, showError, closeError } = useNotification();

	const [loading, setLoading] = useState(true);
	const [mapelList, setMapelList] = useState<MapelCard[]>([]);
	const [materiCount, setMateriCount] = useState<Record<number, number>>({});
	const [tugasCount, setTugasCount] = useState<Record<number, number>>({});

	// Fetch mapel with materi and tugas counts
	const fetchMapelData = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch all mapel
			const mapelResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/dropdown/mata-pelajaran`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!mapelResponse.ok) {
				showError("Gagal memuat mata pelajaran");
				return;
			}

			const mapelData = await mapelResponse.json();
			const mapels = Array.isArray(mapelData)
				? mapelData
				: mapelData.data || [];

			// Fetch published materi
			const materiResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/published-materi`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			let materi: Materi[] = [];
			if (materiResponse.ok) {
				const materiData = await materiResponse.json();
				materi = Array.isArray(materiData) ? materiData : materiData.data || [];
			}

			// Fetch available tugas
			const tugasResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/tugas`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			let tugas: Tugas[] = [];
			if (tugasResponse.ok) {
				const tugasData = await tugasResponse.json();
				tugas = Array.isArray(tugasData) ? tugasData : tugasData.data || [];
			}

			// Count by mapel
			const materiByMapel: Record<number, number> = {};
			const tugasByMapel: Record<number, number> = {};

			materi.forEach((m) => {
				if (m.mataPelajaranId) {
					materiByMapel[m.mataPelajaranId] =
						(materiByMapel[m.mataPelajaranId] || 0) + 1;
				}
			});

			tugas.forEach((t) => {
				if (t.mataPelajaranId) {
					tugasByMapel[t.mataPelajaranId] =
						(tugasByMapel[t.mataPelajaranId] || 0) + 1;
				}
			});

			setMateriCount(materiByMapel);
			setTugasCount(tugasByMapel);

			// Enrich mapel with counts
			const enrichedMapels = mapels.map((m: any) => ({
				...m,
				materi_count: materiByMapel[m.id] || 0,
				tugas_count: tugasByMapel[m.id] || 0,
			}));

			setMapelList(enrichedMapels);
		} catch (error) {
			console.error("Error loading data:", error);
			showError("Terjadi kesalahan saat memuat data");
		} finally {
			setLoading(false);
		}
	}, [token, showError]);

	useEffect(() => {
		if (!isLoading && token) {
			fetchMapelData();
		}
	}, [token, fetchMapelData, isLoading]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">📚 E-Learning</h1>
					<p className="text-gray-600 mt-2">
						Pilih mata pelajaran untuk melihat materi dan tugas
					</p>
				</div>

				{/* Error Toast */}
				<ErrorToast
					isOpen={errorToast.isOpen}
					message={errorToast.message}
					onClose={closeError}
				/>

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
					</div>
				)}

				{/* Grid Cards */}
				{!loading && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{mapelList.map((mapel) => (
							<Link
								key={mapel.id}
								href={`/siswa/elearning/${mapel.id}`}
								className="group"
							>
								<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full hover:scale-105 transform cursor-pointer border border-gray-100">
									{/* Header dengan gradient */}
									<div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
										<h3 className="text-xl font-bold">{mapel.nama}</h3>
										{mapel.guru_nama && (
											<p className="text-purple-100 text-sm mt-1">
												Guru: {mapel.guru_nama}
											</p>
										)}
									</div>

									{/* Content */}
									<div className="p-6">
										{/* Stats */}
										<div className="grid grid-cols-2 gap-4 mb-4">
											{/* Materi Count */}
											<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
												<div className="text-2xl font-bold text-blue-600">
													{materiCount[mapel.id] || 0}
												</div>
												<p className="text-sm text-gray-600 mt-1">Materi</p>
											</div>

											{/* Tugas Count */}
											<div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
												<div className="text-2xl font-bold text-orange-600">
													{tugasCount[mapel.id] || 0}
												</div>
												<p className="text-sm text-gray-600 mt-1">Tugas</p>
											</div>
										</div>

										{/* Description */}
										<div className="text-sm text-gray-600 mb-4">
											{materiCount[mapel.id] ? (
												<p className="text-green-600 font-medium">
													✓ {materiCount[mapel.id]} materi tersedia
												</p>
											) : (
												<p className="text-gray-500">Belum ada materi</p>
											)}
										</div>

										{/* Button */}
										<button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 group-hover:shadow-lg">
											📖 Lihat Materi
										</button>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}

				{/* Empty State */}
				{!loading && mapelList.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-400 text-6xl mb-4">📚</div>
						<h3 className="text-xl font-semibold text-gray-900">
							Belum ada mata pelajaran
						</h3>
						<p className="text-gray-600 mt-2">
							Harap hubungi admin untuk penambahan mata pelajaran
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
