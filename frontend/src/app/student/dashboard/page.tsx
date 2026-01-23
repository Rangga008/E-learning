"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import axios from "axios";

interface StudentStats {
	currentLevel: number;
	poinProgress: number;
	totalPoin: number;
	averageScore: number;
	dailyActive: number;
	courses: Array<{
		id: number;
		nama: string;
		icon?: string;
	}>;
}

export default function StudentDashboard() {
	const router = useRouter();
	const { user, token } = useAuthStore();
	const [stats, setStats] = useState<StudentStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!user || user.role !== "siswa") {
			router.push("/auth/login");
			return;
		}
		fetchStudentStats();
	}, [user, router]);

	const fetchStudentStats = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/siswa/stats`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setStats(response.data.data);
			setError("");
		} catch (err: any) {
			// No fallback data - show error instead
			console.error("Error fetching stats:", err);
			setStats(null);
			setError(
				err.response?.data?.message ||
					"Gagal memuat data statistik. Silakan refresh halaman.",
			);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
					<p className="text-gray-600">Memuat dashboard...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Coba Lagi
					</button>
				</div>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<p className="text-gray-600">Data tidak tersedia</p>
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
						{/* Top Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							{/* Level Card */}
							<div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
								<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
									🏆 Level Kamu
								</h3>
								<div className="text-5xl font-bold mb-2">
									{stats.currentLevel}
								</div>
								<p className="text-sm text-gray-200 mb-4">LEVEL SAAT INI</p>
								<div className="w-full bg-white bg-opacity-20 rounded-full h-2">
									<div
										className="bg-white h-2 rounded-full"
										style={{ width: `${stats.poinProgress}%` }}
									></div>
								</div>
								<p className="text-xs text-gray-200 mt-2">
									Progress: {stats.poinProgress}/100 poin
								</p>
							</div>

							{/* Mission Card */}
							<div className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-lg shadow-lg p-8">
								<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
									🎯 MISI BERHITUNG
								</h3>
								<div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
									<p className="text-sm font-semibold">MULAI KERJAKAN</p>
								</div>
								<p className="text-sm">Hari ini libur (Sabtu/Minggu)</p>
							</div>

							{/* Weekly Stats */}
							<div className="bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-lg shadow-lg p-8">
								<h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
									📊 Statistik Minggu Ini
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-3xl font-bold">{stats.averageScore}</p>
										<p className="text-xs text-gray-100 mt-1">
											Rata-rata Nilai
										</p>
									</div>
									<div>
										<p className="text-3xl font-bold">{stats.dailyActive}/5</p>
										<p className="text-xs text-gray-100 mt-1">Hari Aktif</p>
									</div>
								</div>
							</div>
						</div>

						{/* E-Learning Courses */}
						<div className="bg-white rounded-lg shadow-lg p-8">
							<h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
								📚 E-Learning Terbaru
							</h3>
							<div className="space-y-3">
								{stats.courses.map((course) => (
									<Link
										key={course.id}
										href={`/student/courses/${course.id}`}
										className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition cursor-pointer group"
									>
										<span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
											{course.nama}
										</span>
										<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
											Lihat
										</button>
									</Link>
								))}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
