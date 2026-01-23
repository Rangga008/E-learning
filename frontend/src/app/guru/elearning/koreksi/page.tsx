"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";

interface Essay {
	id: number;
	nisn: string;
	namaStudent: string;
	mapel: string;
	title: string;
	submittedAt: string;
	answer: string;
	isGraded: boolean;
	score?: number;
	feedback?: string;
}

export default function KoreksiPage() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const [essays, setEssays] = useState<Essay[]>([]);
	const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
	const [showGradeModal, setShowGradeModal] = useState(false);
	const [gradeScore, setGradeScore] = useState<string>("");
	const [gradeFeedback, setGradeFeedback] = useState<string>("");
	const [loading, setLoading] = useState(true);

	// Load pending essays from API
	useEffect(() => {
		const loadPendingEssays = async () => {
			try {
				if (!user?.id) return;

				const result = await dashboardService.getPendingEssays(user.id);
				if (result?.essays) {
					setEssays(
						result.essays.map((e: any, idx: number) => ({
							id: e.id || idx + 1,
							nisn: e.nisn,
							namaStudent: e.nama,
							mapel: e.mapel,
							title: `Esai: ${e.mapel}`,
							submittedAt: e.submittedAt,
							answer: "Jawaban dari siswa akan ditampilkan di sini...",
							isGraded: false,
						})),
					);
				}
			} catch (error) {
				console.error("Error loading pending essays:", error);
			} finally {
				setLoading(false);
			}
		};

		loadPendingEssays();
	}, [user?.id]);

	const handleLogout = () => {
		authService.logout();
		logout();
		router.push("/");
	};

	const handleSaveGrade = async () => {
		if (selectedEssay && gradeScore) {
			const score = parseInt(gradeScore);
			if (score >= 0 && score <= 100) {
				// Save to database via API
				if (user?.id) {
					await dashboardService.gradeEssay(
						selectedEssay.id,
						score,
						gradeFeedback,
					);
				}

				const updatedEssays = essays.map((e) =>
					e.id === selectedEssay.id
						? {
								...e,
								isGraded: true,
								score,
								feedback: gradeFeedback,
						  }
						: e,
				);
				setEssays(updatedEssays);
				setSelectedEssay(null);
				setShowGradeModal(false);
				setGradeScore("");
				setGradeFeedback("");
			}
		}
	};

	const pendingEssays = essays.filter((e) => !e.isGraded);
	const gradedEssays = essays.filter((e) => e.isGraded);

	return (
		<div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 p-4">
			{/* Header */}
			<div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl shadow-lg p-6 mb-6">
				<div className="flex justify-between items-start">
					<div>
						<Link
							href="/dashboard/guru"
							className="text-red-100 text-sm hover:underline"
						>
							← Kembali ke Dashboard
						</Link>
						<h1 className="text-3xl font-bold mt-2">Koreksi Jawaban Esai</h1>
						<p className="text-red-100 text-sm mt-1">
							Nilai semua jawaban esai dari siswa
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

			{/* Statistics */}
			<div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
				<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-400">
					<p className="text-gray-600 text-sm">Menunggu Penilaian</p>
					<p className="text-3xl font-bold text-red-600">
						{pendingEssays.length}
					</p>
					<p className="text-xs text-gray-500 mt-1">Jawaban belum dinilai</p>
				</div>
				<div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-400">
					<p className="text-gray-600 text-sm">Sudah Dinilai</p>
					<p className="text-3xl font-bold text-green-600">
						{gradedEssays.length}
					</p>
					<p className="text-xs text-gray-500 mt-1">
						Rata-rata:{" "}
						{gradedEssays.length > 0
							? (
									gradedEssays.reduce((sum, e) => sum + (e.score || 0), 0) /
									gradedEssays.length
							  ).toFixed(1)
							: "—"}
					</p>
				</div>
			</div>

			{/* Pending Essays */}
			{pendingEssays.length > 0 && (
				<div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
					<h2 className="text-2xl font-bold mb-6 text-red-600">
						⏳ Menunggu Penilaian
					</h2>

					<div className="space-y-4">
						{pendingEssays.map((essay) => (
							<div
								key={essay.id}
								className={`p-5 rounded-xl border-2 border-red-300 bg-red-50 hover:shadow-lg transition cursor-pointer ${
									selectedEssay?.id === essay.id ? "ring-2 ring-red-600" : ""
								}`}
								onClick={() => setSelectedEssay(essay)}
							>
								<div className="flex justify-between items-start mb-3">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<span className="text-2xl">✍️</span>
											<div>
												<h3 className="text-lg font-bold">
													{essay.namaStudent}
												</h3>
												<p className="text-sm text-gray-600">{essay.mapel}</p>
											</div>
										</div>
										<p className="text-gray-700 font-semibold">{essay.title}</p>
									</div>
									<div className="text-right ml-4">
										<p className="text-xs text-gray-500">NISN: {essay.nisn}</p>
										<p className="text-xs text-gray-500">
											📅 {essay.submittedAt}
										</p>
									</div>
								</div>

								{selectedEssay?.id === essay.id && (
									<div className="mt-4 pt-4 border-t border-red-200">
										<div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
											<p className="text-sm text-gray-700">{essay.answer}</p>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setShowGradeModal(true);
											}}
											className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition"
										>
											✍️ Berikan Nilai
										</button>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Graded Essays */}
			{gradedEssays.length > 0 && (
				<div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
					<h2 className="text-2xl font-bold mb-6 text-green-600">
						✓ Sudah Dinilai
					</h2>

					<div className="space-y-4">
						{gradedEssays.map((essay) => (
							<div
								key={essay.id}
								className="p-5 rounded-xl border-2 border-green-300 bg-green-50"
								onClick={() => setSelectedEssay(essay)}
							>
								<div className="flex justify-between items-start mb-3">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<span className="text-2xl">✓</span>
											<div>
												<h3 className="text-lg font-bold">
													{essay.namaStudent}
												</h3>
												<p className="text-sm text-gray-600">{essay.mapel}</p>
											</div>
										</div>
										<p className="text-gray-700 font-semibold">{essay.title}</p>
									</div>
									<div className="text-right ml-4">
										<p className="text-3xl font-bold text-green-600">
											{essay.score}
										</p>
										<p className="text-xs text-gray-500">NISN: {essay.nisn}</p>
									</div>
								</div>

								{selectedEssay?.id === essay.id && (
									<div className="mt-4 pt-4 border-t border-green-200">
										<div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
											<p className="text-sm text-gray-700">{essay.answer}</p>
										</div>
										{essay.feedback && (
											<div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
												<p className="text-sm font-semibold text-blue-900">
													Feedback:
												</p>
												<p className="text-sm text-blue-800">
													{essay.feedback}
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{essays.length === 0 && (
				<div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
					<p className="text-gray-500 text-lg">
						Tidak ada jawaban esai untuk dikoreksi
					</p>
				</div>
			)}

			{/* Grade Modal */}
			{showGradeModal && selectedEssay && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h2 className="text-2xl font-bold">Berikan Nilai</h2>
									<p className="text-gray-600">
										{selectedEssay.namaStudent} - {selectedEssay.mapel}
									</p>
								</div>
								<button
									onClick={() => setShowGradeModal(false)}
									className="text-2xl text-gray-400 hover:text-gray-600"
								>
									✕
								</button>
							</div>

							<div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
								<p className="text-sm text-gray-700">{selectedEssay.answer}</p>
							</div>

							<div className="space-y-4 mb-6">
								<div>
									<label className="block text-gray-700 font-semibold mb-2">
										Nilai (0-100) <span className="text-red-600">*</span>
									</label>
									<input
										type="number"
										min="0"
										max="100"
										value={gradeScore}
										onChange={(e) => setGradeScore(e.target.value)}
										placeholder="Masukkan nilai"
										className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-2xl text-center font-semibold"
										autoFocus
									/>
									<p className="text-xs text-gray-500 mt-1">
										{gradeScore &&
											`${100 - parseInt(gradeScore)} poin dari 100`}
									</p>
								</div>

								<div>
									<label className="block text-gray-700 font-semibold mb-2">
										Feedback untuk Siswa
									</label>
									<textarea
										value={gradeFeedback}
										onChange={(e) => setGradeFeedback(e.target.value)}
										placeholder="Berikan feedback konstruktif untuk membantu siswa meningkatkan hasil..."
										className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
										rows={4}
									/>
								</div>
							</div>

							<div className="flex gap-3">
								<button
									onClick={() => setShowGradeModal(false)}
									className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
								>
									Batal
								</button>
								<button
									onClick={handleSaveGrade}
									disabled={
										!gradeScore ||
										parseInt(gradeScore) < 0 ||
										parseInt(gradeScore) > 100
									}
									className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									✓ Simpan Nilai
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
