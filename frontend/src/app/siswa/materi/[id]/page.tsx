"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
		nama: string;
	};
	guru?: {
		nama: string;
	};
	createdAt: string;
}

interface Rencana {
	id?: number;
	rencana: string;
	createdAt?: string;
}

interface Konten {
	id?: number;
	tipeKonten: "TEXT" | "FILE" | "VIDEO";
	judul: string;
	kontenTeks?: string;
	filePath?: string;
	linkVideo?: string;
	createdAt?: string;
}

type TabType = "rencana" | "konten";

export default function SiswaMateriDetailPage() {
	const params = useParams();
	const router = useRouter();
	const materiId = params.id as string;
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

	const { errorToast, showError, closeError } = useNotification();

	const [materi, setMateri] = useState<Materi | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabType>("rencana");
	const [rencanaList, setRencanaList] = useState<Rencana[]>([]);
	const [kontenList, setKontenList] = useState<Konten[]>([]);

	// Fetch materi detail
	const fetchMateriDetail = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat detail materi");
				return;
			}

			const data = await response.json();
			const materiData = data.data || data;
			setMateri(materiData);
		} catch (error) {
			console.error("Error loading materi detail:", error);
			showError("Terjadi kesalahan saat memuat detail materi");
		} finally {
			setLoading(false);
		}
	}, [materiId, token, showError]);

	// Fetch rencana
	const fetchRencana = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/rencana`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setRencanaList(list);
			}
		} catch (error) {
			console.error("Error loading rencana:", error);
		}
	}, [materiId, token]);

	// Fetch konten
	const fetchKonten = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/materi/${materiId}/konten`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const list = Array.isArray(data) ? data : data.data || [];
				setKontenList(list);
			}
		} catch (error) {
			console.error("Error loading konten:", error);
		}
	}, [materiId, token]);

	useEffect(() => {
		if (token && materiId) {
			fetchMateriDetail();
			fetchRencana();
			fetchKonten();
		}
	}, [token, materiId, fetchMateriDetail, fetchRencana, fetchKonten]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Memuat detail materi...</p>
				</div>
			</div>
		);
	}

	if (!materi) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<p className="text-gray-600 text-lg">Materi tidak ditemukan</p>
					<Link
						href="/siswa/materi"
						className="text-blue-600 hover:underline mt-4 inline-block"
					>
						Kembali ke Daftar Materi
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* HEADER */}
			<div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
				<div className="max-w-6xl mx-auto">
					<Link
						href="/siswa/materi"
						className="text-blue-600 hover:underline mb-3 inline-block"
					>
						← Kembali ke Materi
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">
						{materi.judulMateri}
					</h1>
					<div className="flex gap-4 mt-2 text-gray-600">
						<span>📚 {materi.mataPelajaran?.nama}</span>
						<span>👨‍🏫 {materi.guru?.nama || "Unknown"}</span>
						<span>
							📅 {new Date(materi.createdAt).toLocaleDateString("id-ID")}
						</span>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 pb-8">
				{/* TAB NAVIGATION */}
				<div className="bg-white rounded-lg border border-gray-200 mb-6">
					<div className="flex border-b border-gray-200">
						<button
							onClick={() => setActiveTab("rencana")}
							className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
								activeTab === "rencana"
									? "text-blue-600 border-b-2 border-blue-600"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							📋 Rencana Pembelajaran
						</button>
						<button
							onClick={() => setActiveTab("konten")}
							className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
								activeTab === "konten"
									? "text-blue-600 border-b-2 border-blue-600"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							📖 Konten Materi
						</button>
					</div>
				</div>

				{/* RENCANA TAB */}
				{activeTab === "rencana" && (
					<div className="space-y-4">
						{rencanaList.length > 0 ? (
							rencanaList.map((rencana, idx) => (
								<div
									key={idx}
									className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
								>
									<p className="text-gray-700">{rencana.rencana}</p>
									<p className="text-xs text-gray-400 mt-2">
										{new Date(rencana.createdAt || "").toLocaleDateString(
											"id-ID",
										)}
									</p>
								</div>
							))
						) : (
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
								Belum ada rencana pembelajaran
							</div>
						)}
					</div>
				)}

				{/* KONTEN TAB */}
				{activeTab === "konten" && (
					<div className="space-y-4">
						{kontenList.length > 0 ? (
							kontenList.map((konten, idx) => (
								<div
									key={idx}
									className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start gap-3 mb-3">
										<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
											{konten.tipeKonten}
										</span>
										<h3 className="text-lg font-bold text-gray-900">
											{konten.judul}
										</h3>
									</div>

									{konten.tipeKonten === "TEXT" && (
										<div className="bg-gray-50 rounded p-4 mb-3">
											<p className="text-gray-700 whitespace-pre-wrap">
												{konten.kontenTeks}
											</p>
										</div>
									)}

									{konten.tipeKonten === "VIDEO" && (
										<div className="mb-3">
											<a
												href={konten.linkVideo}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline break-all"
											>
												▶️ {konten.linkVideo}
											</a>
										</div>
									)}

									{konten.tipeKonten === "FILE" && (
										<div className="mb-3">
											<a
												href={`data:application/octet-stream;base64,${konten.filePath}`}
												download={konten.judul}
												className="text-blue-600 hover:underline"
											>
												📎 Download: {konten.filePath}
											</a>
										</div>
									)}

									<p className="text-xs text-gray-400">
										{new Date(konten.createdAt || "").toLocaleDateString(
											"id-ID",
										)}
									</p>
								</div>
							))
						) : (
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
								Belum ada konten materi
							</div>
						)}
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
