"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import { SuccessToast, ErrorToast } from "@/components/CommonModals";

interface MateriStats {
	total: number;
	selesai: number;
	sedangBerlangsung: number;
}

interface Tugas {
	id: number;
	judulTugas: string;
	deskripsi: string;
	materi: {
		judulMateri: string;
	};
	status: string;
	tanggalDeadline?: string;
}

export default function SiswaDashboardPage() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const token = useAuthStore((state) => state.token);
	const isLoading = useAuthStore((state) => state.isLoading);

	const {
		successToast,
		errorToast,
		showSuccess,
		showError,
		closeSuccess,
		closeError,
	} = useNotification();

	const [loading, setLoading] = useState(true);
	const [materiStats, setMateriStats] = useState<MateriStats>({
		total: 0,
		selesai: 0,
		sedangBerlangsung: 0,
	});
	const [recentTugas, setRecentTugas] = useState<Tugas[]>([]);

	// Redirect jika bukan siswa
	useEffect(() => {
		if (user && user.role !== "siswa") {
			router.push("/");
		}
	}, [user, router]);

	// Fetch dashboard data
	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch stats
			const statsResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/stats`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (statsResponse.ok) {
				const statsData = await statsResponse.json();
				setMateriStats(statsData.data || statsData);
			}

			// Fetch recent tugas
			const tugasResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/siswa/tugas`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (tugasResponse.ok) {
				const tugasData = await tugasResponse.json();
				const list = Array.isArray(tugasData)
					? tugasData
					: tugasData.data || [];
				setRecentTugas(list.slice(0, 5)); // Show 5 most recent
			}
		} catch (error) {
			console.error("Error loading dashboard:", error);
			showError("Gagal memuat dashboard");
		} finally {
			setLoading(false);
		}
	}, [token, showError]);

	useEffect(() => {
		if (!isLoading && user?.role === "siswa" && token) {
			fetchDashboardData();
		}
	}, [user, token, fetchDashboardData, isLoading]);

	// Check if user is authenticated
	useEffect(() => {
		if (!isLoading && !token) {
			router.push("/auth/login?reason=session_expired");
		}
	}, [isLoading, token, router]);

	// Show loading while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Memuat data Anda...</p>
				</div>
			</div>
		);
	}

	// If not authenticated, show message
	if (!token) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<p className="text-red-600">
						Sesi anda telah berakhir. Silakan login kembali.
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Memuat dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* HEADER */}
			<div className="bg-white border-b border-gray-200 px-6 py-4">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
					<p className="text-gray-600">Selamat datang, {user?.fullName}!</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* STATS CARDS */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Materi</p>
								<p className="text-3xl font-bold text-blue-600">
									{materiStats.total}
								</p>
							</div>
							<div className="text-4xl">📚</div>
						</div>
					</div>

					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Sedang Berlangsung</p>
								<p className="text-3xl font-bold text-yellow-600">
									{materiStats.sedangBerlangsung}
								</p>
							</div>
							<div className="text-4xl">⏳</div>
						</div>
					</div>

					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Selesai</p>
								<p className="text-3xl font-bold text-green-600">
									{materiStats.selesai}
								</p>
							</div>
							<div className="text-4xl">✅</div>
						</div>
					</div>
				</div>

				{/* TUGAS SECTION */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold">Tugas Terbaru</h2>
						<Link
							href="/siswa/tugas"
							className="text-blue-600 hover:text-blue-700 text-sm font-medium"
						>
							Lihat semua →
						</Link>
					</div>

					{recentTugas.length > 0 ? (
						<div className="space-y-3">
							{recentTugas.map((tugas) => (
								<div
									key={tugas.id}
									className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900">
												{tugas.judulTugas}
											</h3>
											<p className="text-sm text-gray-600 mt-1">
												{tugas.materi.judulMateri}
											</p>
											{tugas.tanggalDeadline && (
												<p className="text-xs text-red-600 mt-1">
													Deadline:{" "}
													{new Date(tugas.tanggalDeadline).toLocaleDateString(
														"id-ID",
													)}
												</p>
											)}
										</div>
										<Link
											href={`/siswa/tugas/${tugas.id}`}
											className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
										>
											Kerjakan
										</Link>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-center text-gray-500 py-8">Tidak ada tugas</p>
					)}
				</div>

				{/* QUICK LINKS */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Link
						href="/siswa/materi"
						className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
					>
						<div className="text-4xl mb-4">📖</div>
						<h3 className="font-bold text-gray-900">Materi Pelajaran</h3>
						<p className="text-sm text-gray-600 mt-2">
							Lihat semua materi yang tersedia
						</p>
					</Link>

					<Link
						href="/siswa/tugas"
						className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
					>
						<div className="text-4xl mb-4">✅</div>
						<h3 className="font-bold text-gray-900">Tugas & Kuis</h3>
						<p className="text-sm text-gray-600 mt-2">
							Kerjakan tugas dan kuis Anda
						</p>
					</Link>

					<Link
						href="/siswa/nilai"
						className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
					>
						<div className="text-4xl mb-4">📊</div>
						<h3 className="font-bold text-gray-900">Nilai</h3>
						<p className="text-sm text-gray-600 mt-2">
							Lihat nilai dan hasil tugas Anda
						</p>
					</Link>
				</div>
			</div>

			{/* TOASTS */}
			{successToast.isOpen && (
				<SuccessToast
					isOpen={successToast.isOpen}
					message={successToast.message}
					onClose={closeSuccess}
				/>
			)}
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
