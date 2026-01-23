"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";

interface StudentResult {
	id: number;
	nisn: string;
	nama: string;
	level: number;
	totalSoal: number;
	correct: number;
	score: number;
	status: "passed" | "failed";
	lastAttempt: string;
}

export default function LaporanPage() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const [students, setStudents] = useState<StudentResult[]>([]);
	const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(
		null,
	);
	const [filterLevel, setFilterLevel] = useState<number | null>(null);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [sortBy, setSortBy] = useState<"score" | "name" | "level">("score");
	const [loading, setLoading] = useState(true);

	// Load data from API
	useEffect(() => {
		const loadReportData = async () => {
			try {
				if (!user?.id) return;

				// Simulasi data dari API
				// Dalam implementasi sebenarnya, data ini akan diambil dari endpoint yang sesuai
				const mockData: StudentResult[] = [
					{
						id: 1,
						nisn: "202400001",
						nama: "Ahmad Rizki",
						level: 2,
						totalSoal: 10,
						correct: 9,
						score: 90,
						status: "passed",
						lastAttempt: "2025-01-23 14:30",
					},
					{
						id: 2,
						nisn: "202400002",
						nama: "Budi Santoso",
						level: 1,
						totalSoal: 10,
						correct: 7,
						score: 70,
						status: "failed",
						lastAttempt: "2025-01-23 10:15",
					},
					{
						id: 3,
						nisn: "202400003",
						nama: "Citra Dewi",
						level: 3,
						totalSoal: 10,
						correct: 10,
						score: 100,
						status: "passed",
						lastAttempt: "2025-01-22 16:45",
					},
					{
						id: 4,
						nisn: "202400004",
						nama: "Diana Putri",
						level: 2,
						totalSoal: 10,
						correct: 8,
						score: 80,
						status: "passed",
						lastAttempt: "2025-01-23 11:20",
					},
					{
						id: 5,
						nisn: "202400005",
						nama: "Eka Susanti",
						level: 1,
						totalSoal: 10,
						correct: 6,
						score: 60,
						status: "failed",
						lastAttempt: "2025-01-21 09:00",
					},
				];

				setStudents(mockData);
			} catch (error) {
				console.error("Error loading report data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadReportData();
	}, [user?.id]);

	const handleLogout = () => {
		authService.logout();
		logout();
		router.push("/");
	};

	// Filter dan sort data
	let filteredStudents = students;

	if (filterLevel) {
		filteredStudents = filteredStudents.filter((s) => s.level === filterLevel);
	}

	if (filterStatus !== "all") {
		filteredStudents = filteredStudents.filter(
			(s) => s.status === filterStatus,
		);
	}

	if (sortBy === "score") {
		filteredStudents = filteredStudents.sort((a, b) => b.score - a.score);
	} else if (sortBy === "name") {
		filteredStudents = filteredStudents.sort((a, b) =>
			a.nama.localeCompare(b.nama),
		);
	} else if (sortBy === "level") {
		filteredStudents = filteredStudents.sort((a, b) => b.level - a.level);
	}

	// Calculate statistics
	const avgScore =
		students.length > 0
			? (
					students.reduce((sum, s) => sum + s.score, 0) / students.length
			  ).toFixed(1)
			: 0;
	const passedCount = students.filter((s) => s.status === "passed").length;
	const passPercentage = ((passedCount / students.length) * 100).toFixed(1);

	return (
		<div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl shadow-lg p-6 mb-6">
				<div className="flex justify-between items-start">
					<div>
						<Link
							href="/dashboard/guru"
							className="text-purple-100 text-sm hover:underline"
						>
							← Kembali ke Dashboard
						</Link>
						<h1 className="text-3xl font-bold mt-2">Laporan Numerasi</h1>
						<p className="text-purple-100 text-sm mt-1">
							Analisis hasil latihan soal siswa
						</p>
					</div>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition active:scale-95"
					>
						🚪 Logout
					</button>
				</div>
			</div>

			{loading ? (
				<div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
					<p className="text-gray-500 text-lg">Loading laporan...</p>
				</div>
			) : (
				<>
					{/* Key Statistics */}
					<div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-400">
							<p className="text-gray-600 text-sm">Total Siswa</p>
							<p className="text-3xl font-bold text-blue-600">
								{students.length}
							</p>
							<p className="text-xs text-gray-500 mt-1">Peserta aktif</p>
						</div>
						<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-400">
							<p className="text-gray-600 text-sm">Rata-rata Nilai</p>
							<p className="text-3xl font-bold text-green-600">{avgScore}</p>
							<p className="text-xs text-gray-500 mt-1">Dari 100</p>
						</div>
						<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-400">
							<p className="text-gray-600 text-sm">Lulus (KKM 90)</p>
							<p className="text-3xl font-bold text-purple-600">
								{passedCount}/{students.length}
							</p>
							<p className="text-xs text-gray-500 mt-1">
								{passPercentage}% kelulusan
							</p>
						</div>
						<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-400">
							<p className="text-gray-600 text-sm">Level Rata-rata</p>
							<p className="text-3xl font-bold text-orange-600">
								{(
									students.reduce((sum, s) => sum + s.level, 0) /
									students.length
								).toFixed(1)}
							</p>
							<p className="text-xs text-gray-500 mt-1">Dari level 1-7</p>
						</div>
					</div>

					{/* Filters & Controls */}
					<div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
						<h2 className="text-lg font-bold mb-4">Filter & Pengurutan</h2>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Level
								</label>
								<select
									value={filterLevel ?? "all"}
									onChange={(e) =>
										setFilterLevel(
											e.target.value === "all"
												? null
												: parseInt(e.target.value),
										)
									}
									className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
								>
									<option value="all">Semua Level</option>
									{[1, 2, 3, 4, 5, 6, 7].map((level) => (
										<option key={level} value={level}>
											Level {level}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Status
								</label>
								<select
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value)}
									className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
								>
									<option value="all">Semua Status</option>
									<option value="passed">Lulus (≥90)</option>
									<option value="failed">Belum Lulus (&lt;90)</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Urutan
								</label>
								<select
									value={sortBy}
									onChange={(e) =>
										setSortBy(e.target.value as "score" | "name" | "level")
									}
									className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
								>
									<option value="score">Nilai (Tertinggi)</option>
									<option value="name">Nama (A-Z)</option>
									<option value="level">Level (Tertinggi)</option>
								</select>
							</div>
						</div>
					</div>

					{/* Results Table */}
					<div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
										<th className="px-6 py-4 text-left text-sm font-semibold">
											Nama Siswa
										</th>
										<th className="px-6 py-4 text-left text-sm font-semibold">
											NISN
										</th>
										<th className="px-6 py-4 text-center text-sm font-semibold">
											Level
										</th>
										<th className="px-6 py-4 text-center text-sm font-semibold">
											Benar
										</th>
										<th className="px-6 py-4 text-center text-sm font-semibold">
											Nilai
										</th>
										<th className="px-6 py-4 text-center text-sm font-semibold">
											Status
										</th>
										<th className="px-6 py-4 text-left text-sm font-semibold">
											Terakhir
										</th>
										<th className="px-6 py-4 text-center text-sm font-semibold">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{filteredStudents.map((student) => (
										<tr
											key={student.id}
											className="hover:bg-purple-50 transition cursor-pointer"
											onClick={() => setSelectedStudent(student)}
										>
											<td className="px-6 py-4 text-sm font-semibold">
												{student.nama}
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												{student.nisn}
											</td>
											<td className="px-6 py-4 text-center text-sm">
												<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
													Level {student.level}
												</span>
											</td>
											<td className="px-6 py-4 text-center text-sm font-semibold">
												{student.correct}/{student.totalSoal}
											</td>
											<td className="px-6 py-4 text-center text-lg font-bold">
												<span
													className={`${
														student.status === "passed"
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{student.score}
												</span>
											</td>
											<td className="px-6 py-4 text-center text-sm">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														student.status === "passed"
															? "bg-green-100 text-green-700"
															: "bg-red-100 text-red-700"
													}`}
												>
													{student.status === "passed"
														? "✓ Lulus"
														: "✗ Belum Lulus"}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												{student.lastAttempt}
											</td>
											<td className="px-6 py-4 text-center">
												<button
													onClick={(e) => {
														e.stopPropagation();
														setSelectedStudent(student);
													}}
													className="text-blue-600 hover:text-blue-800 font-semibold"
												>
													👁️ Lihat
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{filteredStudents.length === 0 && (
							<div className="text-center py-12">
								<p className="text-gray-500 text-lg">
									Tidak ada data yang sesuai dengan filter
								</p>
							</div>
						)}
					</div>

					{/* Detail Modal */}
					{selectedStudent && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
							<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
								<div className="p-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h2 className="text-2xl font-bold">
												{selectedStudent.nama}
											</h2>
											<p className="text-gray-600">
												NISN: {selectedStudent.nisn}
											</p>
										</div>
										<button
											onClick={() => setSelectedStudent(null)}
											className="text-2xl text-gray-400 hover:text-gray-600"
										>
											✕
										</button>
									</div>

									<div className="grid grid-cols-2 gap-4 mb-6">
										<div className="bg-blue-50 p-4 rounded-lg">
											<p className="text-gray-600 text-sm">Level</p>
											<p className="text-3xl font-bold text-blue-600">
												{selectedStudent.level}
											</p>
										</div>
										<div className="bg-purple-50 p-4 rounded-lg">
											<p className="text-gray-600 text-sm">Nilai</p>
											<p className="text-3xl font-bold text-purple-600">
												{selectedStudent.score}
											</p>
										</div>
										<div className="bg-green-50 p-4 rounded-lg">
											<p className="text-gray-600 text-sm">Benar</p>
											<p className="text-3xl font-bold text-green-600">
												{selectedStudent.correct}/{selectedStudent.totalSoal}
											</p>
										</div>
										<div
											className={`${
												selectedStudent.status === "passed"
													? "bg-green-50"
													: "bg-red-50"
											} p-4 rounded-lg`}
										>
											<p className="text-gray-600 text-sm">Status</p>
											<p
												className={`text-2xl font-bold ${
													selectedStudent.status === "passed"
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{selectedStudent.status === "passed"
													? "✓ Lulus"
													: "✗ Belum Lulus"}
											</p>
										</div>
									</div>

									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-600">
											Terakhir dikerjakan:
										</p>
										<p className="font-semibold">
											{selectedStudent.lastAttempt}
										</p>
									</div>

									<div className="mt-6 flex gap-3">
										<button
											onClick={() => setSelectedStudent(null)}
											className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
										>
											Tutup
										</button>
										<button className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition">
											📊 Download Laporan
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
