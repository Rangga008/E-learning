"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { ErrorToast } from "@/components/CommonModals";

interface DashboardStats {
	totalMateri: number;
	totalTugas: number;
	totalSiswa: number;
	tugasBelumDikoreksi: number;
}

export default function GuruDashboardPage() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);
	const isLoading = useAuthStore((state) => state.isLoading);

	const { errorToast, showError, closeError } = useNotification();

	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<DashboardStats>({
		totalMateri: 0,
		totalTugas: 0,
		totalSiswa: 0,
		tugasBelumDikoreksi: 0,
	});

	// Fetch dashboard stats
	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);

			// Get guru's materi count
			const materiResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/guru/materi`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			let totalMateri = 0;
			if (materiResponse.ok) {
				const materiData = await materiResponse.json();
				const materiList = Array.isArray(materiData)
					? materiData
					: materiData.data || [];
				totalMateri = materiList.length;
			}

			// Get guru's tugas count
			const tugasResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/guru/tugas`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			let totalTugas = 0;
			if (tugasResponse.ok) {
				const tugasData = await tugasResponse.json();
				const tugasList = Array.isArray(tugasData)
					? tugasData
					: tugasData.data || [];
				totalTugas = tugasList.length;
			}

			setStats({
				totalMateri,
				totalTugas,
				totalSiswa: 0, // Will be fetched from class/students
				tugasBelumDikoreksi: 0, // Will be fetched from jawaban tugas
			});
		} catch (error) {
			console.error("Error loading stats:", error);
			showError("Gagal memuat statistik");
		} finally {
			setLoading(false);
		}
	}, [token, showError]);

	useEffect(() => {
		if (!isLoading && token) {
			fetchStats();
		}
	}, [token, fetchStats, isLoading]);

	// Check if user is authenticated
	useEffect(() => {
		if (!isLoading && !token) {
			router.push("/auth/login?reason=session_expired");
		}
	}, [isLoading, token, router]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Auth check loading */}
				{isLoading && (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
						<p className="ml-4 text-gray-600">Memuat data Anda...</p>
					</div>
				)}

				{!isLoading && !token && (
					<div className="text-center py-12">
						<p className="text-red-600">
							Sesi anda telah berakhir. Silakan login kembali.
						</p>
					</div>
				)}

				{token && (
					<>
						{/* Header */}
						<div className="mb-8">
							<h1 className="text-4xl font-bold text-gray-900">
								Selamat datang, {user?.fullName}! 👨‍🏫
							</h1>
							<p className="text-gray-600 mt-2">
								Kelola materi dan tugas pembelajaran Anda
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
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
							</div>
						)}

						{!loading && (
							<>
								{/* Stats Cards */}
								<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
									{/* Total Materi */}
									<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-gray-600 text-sm">Total Materi</p>
												<p className="text-3xl font-bold text-blue-600 mt-2">
													{stats.totalMateri}
												</p>
											</div>
											<div className="text-4xl">📚</div>
										</div>
									</div>

									{/* Total Tugas */}
									<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-gray-600 text-sm">Total Tugas</p>
												<p className="text-3xl font-bold text-orange-600 mt-2">
													{stats.totalTugas}
												</p>
											</div>
											<div className="text-4xl">✏️</div>
										</div>
									</div>

									{/* Tugas Belum Dikoreksi */}
									<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-gray-600 text-sm">Belum Dikoreksi</p>
												<p className="text-3xl font-bold text-red-600 mt-2">
													{stats.tugasBelumDikoreksi}
												</p>
											</div>
											<div className="text-4xl">🔍</div>
										</div>
									</div>

									{/* Total Siswa */}
									<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-gray-600 text-sm">Total Siswa</p>
												<p className="text-3xl font-bold text-green-600 mt-2">
													{stats.totalSiswa}
												</p>
											</div>
											<div className="text-4xl">👨‍🎓</div>
										</div>
									</div>
								</div>

								{/* Quick Action Cards */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{/* E-Learning */}
									<Link href="/guru/elearning" className="block group">
										<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border-b-4 border-blue-500 group-hover:border-blue-700">
											<div className="flex items-start justify-between mb-4">
												<div>
													<h3 className="text-xl font-bold text-gray-900">
														📚 E-Learning
													</h3>
													<p className="text-gray-600 text-sm mt-1">
														Kelola materi dan tugas pembelajaran
													</p>
												</div>
												<span className="text-3xl">→</span>
											</div>
											<button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
												Buka E-Learning
											</button>
										</div>
									</Link>

									{/* Koreksi Jawaban */}
									<Link href="/guru/elearning/koreksi" className="block group">
										<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border-b-4 border-orange-500 group-hover:border-orange-700">
											<div className="flex items-start justify-between mb-4">
												<div>
													<h3 className="text-xl font-bold text-gray-900">
														🔍 Koreksi Jawaban
													</h3>
													<p className="text-gray-600 text-sm mt-1">
														Periksa dan nilai jawaban siswa
													</p>
												</div>
												<span className="text-3xl">→</span>
											</div>
											<button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
												Lihat Jawaban
											</button>
										</div>
									</Link>

									{/* Pelaporan */}
									<Link href="/guru/pelaporan" className="block group">
										<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border-b-4 border-green-500 group-hover:border-green-700">
											<div className="flex items-start justify-between mb-4">
												<div>
													<h3 className="text-xl font-bold text-gray-900">
														📊 Pelaporan
													</h3>
													<p className="text-gray-600 text-sm mt-1">
														Lihat laporan perkembangan siswa
													</p>
												</div>
												<span className="text-3xl">→</span>
											</div>
											<button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
												Buka Laporan
											</button>
										</div>
									</Link>
								</div>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}
