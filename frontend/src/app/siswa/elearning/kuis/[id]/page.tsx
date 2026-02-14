"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/hooks/useNotification";
import { useKerjakanTugas } from "@/hooks/useKerjakanTugas";

export default function SiswaKuisEssayPage() {
	const params = useParams();
	const router = useRouter();
	const { showSuccess, showError } = useNotification();
	const kuisId = Number(params.id);

	// Use the custom hook for task management
	const {
		taskDetail,
		essayQuestions,
		studentAnswers,
		loading,
		error,
		isLate,
		timeRemaining,
		submitAllAnswers,
		getAnswer,
		formatDate,
	} = useKerjakanTugas(kuisId);

	const [formData, setFormData] = useState<{ [key: number]: string }>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	// Initialize form data from answers
	useEffect(() => {
		if (essayQuestions.length > 0 && studentAnswers.size > 0) {
			const initialData: { [key: number]: string } = {};
			essayQuestions.forEach((soal) => {
				const answer = studentAnswers.get(soal.id);
				initialData[soal.id] = answer?.jawaban || "";
			});
			setFormData(initialData);
			setSubmitted(studentAnswers.size > 0);
		}
	}, [essayQuestions, studentAnswers]);

	// Show error if any
	useEffect(() => {
		if (error) {
			showError(error);
		}
	}, [error, showError]);

	const handleAnswerChange = (soalId: number, jawaban: string) => {
		setFormData((prev) => ({
			...prev,
			[soalId]: jawaban,
		}));
	};

	const handleSubmitAll = async () => {
		// Validate all answers
		const allAnswered = essayQuestions.every((soal) =>
			formData[soal.id]?.trim(),
		);
		if (!allAnswered) {
			showError("Semua soal harus dijawab");
			return;
		}

		if (
			!confirm(
				"Apakah Anda yakin ingin mensubmit semua jawaban? Anda tidak bisa mengubah jawaban setelah submisi.",
			)
		) {
			return;
		}

		try {
			setSubmitting(true);
			const answersToSubmit: { [key: number]: string } = {};
			essayQuestions.forEach((soal) => {
				answersToSubmit[soal.id] = formData[soal.id];
			});

			await submitAllAnswers(answersToSubmit);
			showSuccess("Semua jawaban berhasil disubmit!");
			setSubmitted(true);
		} catch (error) {
			showError("Gagal mensubmit jawaban");
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	const formatDateDisplay = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("id-ID", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!taskDetail) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Kuis tidak ditemukan
					</h1>
					<Link
						href="/siswa/elearning"
						className="text-blue-600 hover:text-blue-700"
					>
						Kembali ke daftar materi
					</Link>
				</div>
			</div>
		);
	}

	const allAnswered = essayQuestions.every((soal) => formData[soal.id]?.trim());
	const totalBobot = essayQuestions.reduce((sum, soal) => sum + soal.bobot, 0);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between mb-4">
						<Link
							href="/siswa/elearning"
							className="text-blue-600 hover:text-blue-700"
						>
							← Kembali
						</Link>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{taskDetail.judulTugas}
					</h1>
					{taskDetail.materi && (
						<p className="text-gray-600">
							Materi: {taskDetail.materi.judulMateri}
						</p>
					)}
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Status Card */}
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<div className="grid grid-cols-3 gap-4">
						<div>
							<div className="text-sm text-gray-600 mb-1">Jumlah Soal</div>
							<div className="text-2xl font-bold text-blue-600">
								{essayQuestions.length}
							</div>
						</div>
						<div>
							<div className="text-sm text-gray-600 mb-1">Total Bobot</div>
							<div className="text-2xl font-bold text-blue-600">
								{totalBobot}
							</div>
						</div>
						<div>
							<div className="text-sm text-gray-600 mb-1">Status</div>
							<div
								className={`text-lg font-semibold ${
									submitted ? "text-green-600" : "text-orange-600"
								}`}
							>
								{submitted ? "Sudah Disubmit" : "Belum Disubmit"}
							</div>
						</div>
					</div>

					<div className="mt-4 grid grid-cols-2 gap-4">
						<div>
							<div className="text-sm font-semibold text-gray-700 mb-1">
								Tanggal Buka
							</div>
							<div className="text-gray-600 text-sm">
								{formatDateDisplay(taskDetail.tanggalBuka)}
							</div>
						</div>
						<div>
							<div className="text-sm font-semibold text-gray-700 mb-1">
								Deadline
							</div>
							<div
								className={`text-gray-600 text-sm ${
									isLate ? "text-red-600" : ""
								}`}
							>
								{formatDateDisplay(taskDetail.tanggalDeadline)}
								{isLate && (
									<span className="ml-2 font-semibold">(Terlambat)</span>
								)}
							</div>
						</div>
					</div>

					{/* Time Remaining */}
					{!isLate && timeRemaining && (
						<div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
							<p className="text-sm text-blue-700">
								Waktu tersisa:{" "}
								<span className="font-semibold">
									{timeRemaining.days} hari {timeRemaining.hours} jam{" "}
									{timeRemaining.minutes} menit
								</span>
							</p>
						</div>
					)}
				</div>

				{/* Deskripsi */}
				{taskDetail.deskripsi && (
					<div className="bg-white rounded-lg shadow p-6 mb-8">
						<h2 className="text-lg font-bold text-gray-900 mb-4">Instruksi</h2>
						<p className="text-gray-700 whitespace-pre-wrap">
							{taskDetail.deskripsi}
						</p>
					</div>
				)}

				{/* Soal Essay */}
				<div className="space-y-6">
					{essayQuestions.map((soal, index) => {
						const jawaban = studentAnswers.get(soal.id);
						const isAnswered = !!formData[soal.id]?.trim();

						return (
							<div key={soal.id} className="bg-white rounded-lg shadow p-6">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h3 className="text-lg font-bold text-gray-900">
											Soal {index + 1}
										</h3>
										<p className="text-sm text-gray-500 mt-1">
											Bobot: {soal.bobot} poin
										</p>
									</div>
									{isAnswered && (
										<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
											✓ Terjawab
										</span>
									)}
								</div>

								<p className="text-gray-700 mb-6 whitespace-pre-wrap">
									{soal.pertanyaan}
								</p>

								{/* Answer Textarea */}
								{submitted ? (
									<>
										<div className="bg-gray-50 rounded-lg p-4 mb-4">
											<p className="text-gray-700 whitespace-pre-wrap">
												{formData[soal.id]}
											</p>
										</div>
										{jawaban?.sudahDinilai && (
											<div className="p-4 bg-green-50 rounded-lg border border-green-200">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-semibold text-gray-700">
														Nilai
													</span>
													<span className="text-2xl font-bold text-green-600">
														{jawaban.nilai || 0}
													</span>
												</div>
												{jawaban.catatanGuru && (
													<>
														<div className="text-sm font-semibold text-gray-700 mt-3 mb-2">
															Umpan Balik
														</div>
														<p className="text-gray-700 whitespace-pre-wrap text-sm">
															{jawaban.catatanGuru}
														</p>
													</>
												)}
											</div>
										)}
									</>
								) : (
									<textarea
										value={formData[soal.id] || ""}
										onChange={(e) =>
											handleAnswerChange(soal.id, e.target.value)
										}
										placeholder="Ketik jawaban Anda di sini..."
										className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={6}
										disabled={submitting}
									/>
								)}
							</div>
						);
					})}
				</div>

				{/* Submit Button */}
				{!submitted && (
					<div className="mt-8 flex gap-4">
						<button
							onClick={handleSubmitAll}
							disabled={!allAnswered || submitting}
							className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
								!allAnswered || submitting
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{submitting ? "Sedang mengirim..." : "Kirim Semua Jawaban"}
						</button>
						<Link
							href="/siswa/elearning"
							className="py-3 px-6 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
						>
							Batal
						</Link>
					</div>
				)}

				{submitted && (
					<div className="mt-8 space-y-6">
						<div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-600">
							<h3 className="text-lg font-bold text-green-900 mb-2">
								Jawaban Berhasil Disubmit
							</h3>
							<p className="text-green-700 mb-4">
								Guru akan mengoreksi jawaban Anda. Anda akan menerima notifikasi
								ketika nilai sudah diinputkan.
							</p>
							<button
								onClick={async () => {
									if (
										confirm(
											"Apakah Anda yakin ingin menghapus semua jawaban? Anda akan bisa menjawab ulang.",
										)
									) {
										try {
											let allDeleted = true;
											for (const [
												soalId,
												jawaban,
											] of studentAnswers.entries()) {
												try {
													const res = await fetch(
														`/api/elearning/jawaban-esai/${jawaban.id}`,
														{
															method: "DELETE",
														},
													);
													if (!res.ok) {
														allDeleted = false;
													}
												} catch (error) {
													allDeleted = false;
													console.error(
														`Gagal hapus jawaban ${soalId}:`,
														error,
													);
												}
											}
											if (allDeleted) {
												showSuccess("Semua jawaban berhasil dihapus");
												window.location.reload();
											} else {
												showError("Beberapa jawaban gagal dihapus");
											}
										} catch (error) {
											showError("Gagal menghapus jawaban");
											console.error(error);
										}
									}
								}}
								className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
							>
								Hapus Semua Jawaban & Kerjakan Ulang
							</button>
						</div>

						{/* Submission Summary */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-bold text-gray-900 mb-4">
								Ringkasan Submission
							</h3>
							<div className="space-y-2">
								{essayQuestions.map((soal, index) => {
									const jawaban = studentAnswers.get(soal.id);
									return (
										<div
											key={soal.id}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
										>
											<div className="flex items-center gap-3">
												<div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
													✓
												</div>
												<span className="text-gray-700 font-medium">
													Soal {index + 1}: {soal.pertanyaan.substring(0, 50)}
													{soal.pertanyaan.length > 50 ? "..." : ""}
												</span>
											</div>
											{jawaban?.sudahDinilai && (
												<span className="text-xs font-semibold px-3 py-1 bg-green-200 text-green-800 rounded-full">
													Dinilai: {jawaban.nilai}
												</span>
											)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
