"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import axios from "axios";

interface TeacherStats {
	needsCorrection: number;
	newAssignments: number;
	classes: Array<{
		id: number;
		nama: string;
		totalSiswa: number;
		averageScore: number;
	}>;
	recentSubmissions: Array<{
		siswa: string;
		judul: string;
		nilai: number;
		status: "baik" | "perbaiki";
	}>;
}

export default function TeacherDashboard() {
	const router = useRouter();
	const { user, token } = useAuthStore();
	const [stats, setStats] = useState<TeacherStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!user || user.role !== "guru") {
			router.push("/auth/login");
			return;
		}
		fetchTeacherStats();
	}, [user, router]);

	const fetchTeacherStats = async () => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/guru/stats`,
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
					<p className="text-gray-600">Memuat dashboard guru...</p>
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
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Perlu Diperiksa */}
						<div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg p-8">
							<h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
								🏠 Perlu Diperiksa
							</h3>
							<div className="grid grid-cols-2 gap-4 mb-6">
								<div>
									<p className="text-3xl font-bold">{stats.needsCorrection}</p>
									<p className="text-xs text-gray-100 mt-1">Jawaban Esai</p>
								</div>
								<div>
									<p className="text-3xl font-bold">{stats.newAssignments}</p>
									<p className="text-xs text-gray-100 mt-1">Tugas Baru</p>
								</div>
							</div>
							<button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg font-semibold transition">
								Mulai Koreksi
							</button>
						</div>

						{/* Jurnal Kelas Hari Ini */}
						<div className="bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 rounded-lg shadow-lg p-8">
							<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
								📋 Jurnal Kelas Hari Ini
							</h3>
							<div className="space-y-2">
								<div className="bg-red-100 border-l-4 border-red-500 p-3 rounded">
									<p className="font-semibold text-sm">Eko Prasetyo</p>
									<p className="text-xs text-gray-600">
										Tidak mengerjakan numerasi - Nilai: 0
									</p>
								</div>
								<div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
									<p className="font-semibold text-sm">25 Siswa</p>
									<p className="text-xs text-gray-600">
										Mengerjakan dengan baik
									</p>
								</div>
							</div>
						</div>

						{/* Aksi Cepat */}
						<div className="bg-white rounded-lg shadow-lg p-8">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
								⚡ Aksi Cepat
							</h3>
							<div className="space-y-2">
								<button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
									➕ Tambah Materi
								</button>
								<button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
									📝 Input Soal
								</button>
								<button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
									📊 Lihat Laporan
								</button>
							</div>
						</div>

						{/* Statistik Kelas */}
						<div className="md:col-span-3 bg-white rounded-lg shadow-lg p-8">
							<h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
								📈 Statistik Kelas{" "}
								{stats.classes.length > 0 ? stats.classes[0].nama : ""}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{stats.classes.map((kelas) => (
									<Link
										key={kelas.id}
										href={`/teacher/classes/${kelas.id}`}
										className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition cursor-pointer"
									>
										<h4 className="text-xl font-bold text-gray-800 mb-4">
											{kelas.nama}
										</h4>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-3xl font-bold text-blue-600">
													{kelas.totalSiswa}
												</p>
												<p className="text-sm text-gray-600 mt-1">
													Total Siswa
												</p>
											</div>
											<div>
												<p className="text-3xl font-bold text-purple-600">
													{kelas.averageScore.toFixed(1)}
												</p>
												<p className="text-sm text-gray-600 mt-1">
													Rata-rata Kelas
												</p>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
