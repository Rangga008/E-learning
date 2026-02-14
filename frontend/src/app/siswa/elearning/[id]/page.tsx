"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { ErrorToast, SuccessToast } from "@/components/CommonModals";

interface Materi {
	id: number;
	judulMateri: string;
	deskripsi: string;
	status: "DRAFT" | "PUBLISHED" | "CLOSED";
	urutan: number;
}

interface Tugas {
	id: number;
	judulTugas: string;
	deskripsi: string;
	tanggalBuka: string;
	tanggalDeadline?: string;
	tipeSubmisi: string;
	status: "DRAFT" | "PUBLISHED" | "CLOSED";
}

interface MateriProgress {
	[materiId: number]: {
		taskCount: number;
		completedCount: number;
	};
}

export default function SiswaMapelDetailPage() {
	const params = useParams();
	const router = useRouter();
	const mapelId = params.id as string;

	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);

	const {
		errorToast,
		showError,
		closeError,
		successToast,
		showSuccess,
		closeSuccess,
	} = useNotification();

	const [loading, setLoading] = useState(true);
	const [mapelName, setMapelName] = useState("");
	const [activeTab, setActiveTab] = useState<"materi" | "tugas">("materi");
	const [materi, setMateri] = useState<Materi[]>([]);
	const [tugas, setTugas] = useState<Tugas[]>([]);
	const [materiProgress, setMateriProgress] = useState<MateriProgress>({});

	// Fetch materi
	const fetchMateri = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/materi/${mapelId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const materiList = Array.isArray(data) ? data : data.data || [];
				setMateri(
					materiList
						.filter((m: any) => m.status === "PUBLISHED")
						.sort((a: any, b: any) => a.urutan - b.urutan),
				);
			}
		} catch (error) {
			console.error("Error loading materi:", error);
		}
	}, [mapelId, token]);

	// Fetch tugas
	const fetchTugas = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/tugas/${mapelId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const tugasList = Array.isArray(data) ? data : data.data || [];
				setTugas(tugasList.filter((t: any) => t.status === "PUBLISHED"));
			}
		} catch (error) {
			console.error("Error loading tugas:", error);
		}
	}, [mapelId, token]);

	// Fetch mapel name
	const fetchMapelName = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/dropdown/mata-pelajaran`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (response.ok) {
				const data = await response.json();
				const mapels = Array.isArray(data) ? data : data.data || [];
				const found = mapels.find((m: any) => m.id === parseInt(mapelId));
				if (found) {
					setMapelName(found.nama);
				}
			}
		} catch (error) {
			console.error("Error loading mapel name:", error);
		}
	}, [mapelId, token]);

	// Fetch task count for each materi
	const fetchTaskCountForMateri = useCallback(
		async (materiId: number) => {
			try {
				if (!user?.id || !token) return;

				const jawabanRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/${user.id}/materi/${materiId}/jawaban-count`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);

				if (jawabanRes.ok) {
					const jawabanData = await jawabanRes.json();
					const taskCount = jawabanData.taskCount || 0;
					const completedCount = jawabanData.completedCount || 0;

					setMateriProgress((prev) => ({
						...prev,
						[materiId]: {
							taskCount,
							completedCount,
						},
					}));
				}
			} catch (error) {
				console.error("Error loading task count:", error);
			}
		},
		[token, user?.id],
	);

	useEffect(() => {
		if (token) {
			Promise.all([fetchMateri(), fetchTugas(), fetchMapelName()]).finally(() =>
				setLoading(false),
			);
		}
	}, [token, fetchMateri, fetchTugas, fetchMapelName]);

	// Fetch task counts for each materi once materi is loaded
	useEffect(() => {
		materi.forEach((m) => {
			if (!materiProgress[m.id]) {
				fetchTaskCountForMateri(m.id);
			}
		});
	}, [materi, materiProgress, fetchTaskCountForMateri]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
			<div className="max-w-5xl mx-auto">
				{/* Back Button */}
				<button
					onClick={() => router.push("/siswa/elearning")}
					className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 font-medium"
				>
					← Kembali
				</button>

				{/* Error Toast */}
				<ErrorToast
					isOpen={errorToast.isOpen}
					message={errorToast.message}
					onClose={closeError}
				/>

				{/* Success Toast */}
				<SuccessToast
					isOpen={successToast.isOpen}
					message={successToast.message}
					onClose={closeSuccess}
				/>

				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-8">
					<h1 className="text-3xl font-bold">{mapelName || "Loading..."}</h1>
					<p className="text-purple-100 mt-2">
						Materi: {materi.length} | Tugas: {tugas.length}
					</p>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
					</div>
				)}

				{/* Content */}
				{!loading && activeTab === "materi" && (
					<div className="space-y-4">
						{materi.length > 0 ? (
							materi.map((m, idx) => {
								const progress = materiProgress[m.id];
								const taskCount = progress?.taskCount || 0;
								const completedCount = progress?.completedCount || 0;
								const progressPercent =
									taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
								return (
									<Link
										key={m.id}
										href={`/siswa/elearning/materi/${m.id}`}
										className="block"
									>
										<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 border-purple-500 hover:border-purple-700 cursor-pointer">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-gray-900">
														{idx + 1}. {m.judulMateri}
													</h3>
													<p className="text-gray-600 mt-2 line-clamp-2">
														{m.deskripsi}
													</p>

													{/* Progress Bar */}
													{taskCount > 0 && (
														<div className="mt-4">
															<div className="flex items-center justify-between mb-2">
																<span className="text-xs font-medium text-gray-700">
																	Progress Tugas
																</span>
																<span className="text-xs font-semibold text-purple-600">
																	{completedCount}/{taskCount} (
																	{Math.round(progressPercent)}%)
																</span>
															</div>
															<div className="w-full bg-gray-200 rounded-full h-2">
																<div
																	className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
																	style={{ width: `${progressPercent}%` }}
																></div>
															</div>
														</div>
													)}
												</div>
												<span className="text-2xl ml-4">→</span>
											</div>
										</div>
									</Link>
								);
							})
						) : (
							<div className="text-center py-12 bg-white rounded-lg">
								<p className="text-gray-500 text-lg">
									Belum ada materi untuk mata pelajaran ini
								</p>
							</div>
						)}
					</div>
				)}

				{!loading && activeTab === "tugas" && (
					<div className="space-y-4">
						{tugas.length > 0 ? (
							tugas.map((t, idx) => (
								<div
									key={t.id}
									className="block opacity-50 cursor-not-allowed"
									title="Buka tugas dari halaman materi"
								>
									<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 border-orange-500 hover:border-orange-700 cursor-pointer">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h3 className="text-lg font-semibold text-gray-900">
													{idx + 1}. {t.judulTugas}
												</h3>
												<p className="text-gray-600 mt-2 line-clamp-2">
													{t.deskripsi}
												</p>
												<div className="flex gap-4 mt-3 text-sm">
													<span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
														📅
														{new Date(t.tanggalBuka).toLocaleDateString(
															"id-ID",
														)}
													</span>
													{t.tanggalDeadline && (
														<span className="bg-red-100 text-red-700 px-2 py-1 rounded">
															⏰
															{new Date(t.tanggalDeadline).toLocaleDateString(
																"id-ID",
															)}
														</span>
													)}
												</div>
											</div>
											<span className="text-2xl ml-4">→</span>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-12 bg-white rounded-lg">
								<p className="text-gray-500 text-lg">
									Belum ada tugas untuk mata pelajaran ini
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
