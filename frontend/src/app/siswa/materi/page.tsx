"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { ErrorToast } from "@/components/CommonModals";

interface Materi {
	id: number;
	judulMateri: string;
	deskripsi: string;
	status: "DRAFT" | "PUBLISHED" | "CLOSED";
	mataPelajaran?: {
		id: number;
		nama: string;
	};
	guru?: {
		nama: string;
	};
	createdAt: string;
}

export default function SiswaMateriPage() {
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

	const { errorToast, showError, closeError } = useNotification();

	const [loading, setLoading] = useState(true);
	const [materi, setMateri] = useState<Materi[]>([]);
	const [filteredMateri, setFilteredMateri] = useState<Materi[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedMapel, setSelectedMapel] = useState<string>("");
	const [mapelList, setMapelList] = useState<{ id: number; nama: string }[]>(
		[],
	);

	// Fetch materi
	const fetchMateri = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/published-materi`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat materi");
				return;
			}

			const data = await response.json();
			const materiList = Array.isArray(data) ? data : data.data || [];
			setMateri(materiList);
			setFilteredMateri(materiList);
		} catch (error) {
			console.error("Error loading materi:", error);
			showError("Terjadi kesalahan saat memuat materi");
		} finally {
			setLoading(false);
		}
	}, [token, showError]);

	// Fetch mata pelajaran
	const fetchMapel = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/dropdown/mata-pelajaran`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setMapelList(list);
			}
		} catch (error) {
			console.error("Error loading mapel:", error);
		}
	}, [token]);

	useEffect(() => {
		if (token) {
			fetchMateri();
			fetchMapel();
		}
	}, [token, fetchMateri, fetchMapel]);

	// Filter materi
	useEffect(() => {
		let filtered = materi;

		if (searchTerm) {
			filtered = filtered.filter(
				(m) =>
					m.judulMateri.toLowerCase().includes(searchTerm.toLowerCase()) ||
					m.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		if (selectedMapel) {
			filtered = filtered.filter(
				(m) => m.mataPelajaran?.id === parseInt(selectedMapel),
			);
		}

		setFilteredMateri(filtered);
	}, [searchTerm, selectedMapel, materi]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Memuat materi...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* HEADER */}
			<div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900">Materi Pelajaran</h1>
					<p className="text-gray-600">
						Total: {filteredMateri.length} materi tersedia
					</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 pb-8">
				{/* FILTERS */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								🔍 Cari Materi
							</label>
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Cari berdasarkan judul atau deskripsi..."
								className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								📚 Mata Pelajaran
							</label>
							<select
								value={selectedMapel}
								onChange={(e) => setSelectedMapel(e.target.value)}
								className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">Semua Mata Pelajaran</option>
								{mapelList.map((mapel) => (
									<option key={mapel.id} value={mapel.id}>
										{mapel.nama}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* MATERI LIST */}
				{filteredMateri.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredMateri.map((m) => (
							<Link
								key={m.id}
								href={`/siswa/materi/${m.id}`}
								className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
							>
								<div className="flex items-start justify-between mb-3">
									<div className="text-3xl">📖</div>
									<span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
										{m.status}
									</span>
								</div>

								<h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
									{m.judulMateri}
								</h3>

								<p className="text-sm text-gray-600 mb-3 line-clamp-3">
									{m.deskripsi}
								</p>

								<div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
									<p>{m.mataPelajaran?.nama}</p>
									<p>📝 {m.guru?.nama}</p>
									<p>📅 {new Date(m.createdAt).toLocaleDateString("id-ID")}</p>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
						<div className="text-4xl mb-3">📚</div>
						<p className="text-gray-500 text-lg">
							Tidak ada materi yang ditemukan
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
