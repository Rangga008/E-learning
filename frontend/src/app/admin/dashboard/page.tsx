"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import axios from "axios";

interface Statistics {
	totalUser: number;
	totalSiswa: number;
	totalGuru: number;
	totalUserAktif: number;
}

export default function AdminDashboard() {
	const router = useRouter();
	const { user, token } = useAuthStore();
	const [stats, setStats] = useState<Statistics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		// Check auth
		if (!user || user.role !== "admin") {
			router.push("/auth/login");
			return;
		}

		// Fetch statistics
		fetchStatistics();
	}, [user, router]);

	const fetchStatistics = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/statistics`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			setStats(response.data.data);
			setError("");
		} catch (err: any) {
			setError(err.response?.data?.message || "Gagal load statistik");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
					<p className="text-gray-600">Memuat...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				</div>

				{stats && (
					<>
						{/* Statistik Sistem */}
						<div className="bg-white rounded-lg shadow p-6 mb-6">
							<h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
								💻 Statistik Sistem
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
								<div>
									<div className="text-4xl font-bold text-blue-600">150</div>
									<div className="text-sm text-gray-600 mt-2">Total Siswa</div>
								</div>
								<div>
									<div className="text-4xl font-bold text-blue-600">15</div>
									<div className="text-sm text-gray-600 mt-2">Total Guru</div>
								</div>
								<div>
									<div className="text-4xl font-bold text-blue-600">2,450</div>
									<div className="text-sm text-gray-600 mt-2">Bank Soal</div>
								</div>
								<div>
									<div className="text-4xl font-bold text-blue-600">85%</div>
									<div className="text-sm text-gray-600 mt-2">Keaktifan</div>
								</div>
							</div>
						</div>

						{/* Main Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Kontrol Sistem */}
							<div className="bg-white rounded-lg shadow p-6">
								<h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
									⚙️ Kontrol Sistem
								</h2>
								<div className="space-y-3">
									<Link
										href="/admin/siswa"
										className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-semibold transition"
									>
										👥 Data Siswa
									</Link>
									<Link
										href="/admin/guru"
										className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-semibold transition"
									>
										🎓 Data Guru
									</Link>
									<button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg text-center font-semibold transition">
										🔄 Reset Level (Trial)
									</button>
								</div>
							</div>

							{/* Timeline Peluncuran */}
							<div className="bg-white rounded-lg shadow p-6">
								<h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
									📅 Timeline Peluncuran
								</h2>
								<div className="space-y-4">
									<div className="border-l-4 border-blue-600 pl-4">
										<div className="font-semibold text-gray-900">
											FASE 1: Trial
										</div>
										<div className="text-sm text-gray-600">
											19-23 Januari 2026
										</div>
									</div>
									<div className="border-l-4 border-orange-500 pl-4">
										<div className="font-semibold text-gray-900">
											FASE 2: Reset
										</div>
										<div className="text-sm text-gray-600">
											24-25 Januari 2026
										</div>
									</div>
									<div className="border-l-4 border-green-600 pl-4">
										<div className="font-semibold text-gray-900">Go Live</div>
										<div className="text-sm text-gray-600">
											26 Januari 2026 (Senin)
										</div>
									</div>
								</div>
							</div>

							{/* Kesehatan Sistem */}
							<div className="bg-white rounded-lg shadow p-6">
								<h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
									❤️ Kesehatan Sistem
								</h2>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-gray-700 font-medium">Database</span>
										<span className="text-green-600 font-semibold">
											✓ Normal
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-gray-700 font-medium">Server</span>
										<span className="text-green-600 font-semibold">
											✓ Normal
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-gray-700 font-medium">Backup</span>
										<span className="text-green-600 font-semibold">
											✓ Terbaru
										</span>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
