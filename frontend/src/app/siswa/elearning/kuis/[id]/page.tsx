"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/hooks/useNotification";

interface SoalEsai {
	id: number;
	pertanyaan: string;
	bobot: number;
}

interface Kuis {
	id: number;
	judulTugas: string;
	deskripsi: string;
	tanggalBuka: string;
	tanggalDeadline: string;
	materi?: {
		id: number;
		judulMateri: string;
	};
}

interface JawabanEsai {
	id: number;
	soalEsaiId: number;
	jawaban: string;
	nilai?: number;
	catatanGuru?: string;
	sudahDinilai: boolean;
}

export default function SiswaKuisEssayPage() {
	const params = useParams();
	const router = useRouter();
	const { showSuccess, showError } = useNotification();
	const kuisId = Number(params.id);

	const [kuis, setKuis] = useState<Kuis | null>(null);
	const [soalList, setSoalList] = useState<SoalEsai[]>([]);
	const [jawabanMap, setJawabanMap] = useState<Map<number, JawabanEsai>>(
		new Map(),
	);
	const [formData, setFormData] = useState<{ [key: number]: string }>({});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [totalBobot, setTotalBobot] = useState(0);

	const fetchKuisDetail = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch kuis info
			const kuisRes = await fetch(`/api/elearning/tugas/${kuisId}`);
			if (!kuisRes.ok) throw new Error("Gagal memuat detail kuis");
			const kuisData = await kuisRes.json();
			setKuis(kuisData);

			// Fetch soal essay
			const soalRes = await fetch(`/api/elearning/soal-esai/tugas/${kuisId}`);
			if (soalRes.ok) {
				const soalData = await soalRes.json();
				setSoalList(soalData);

				// Calculate total bobot
				const total = soalData.reduce(
					(sum: number, soal: SoalEsai) => sum + soal.bobot,
					0,
				);
				setTotalBobot(total);

				// Initialize form with existing answers
				fetchJawaban(soalData);
			}
		} catch (error) {
			showError("Gagal memuat detail kuis");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [kuisId, showError]);

	useEffect(() => {
		fetchKuisDetail();
	}, [fetchKuisDetail]);

	const fetchJawaban = async (soalData: SoalEsai[]) => {
		try {
			const jawabanMap = new Map<number, JawabanEsai>();
			let hasSubmitted = false;

			for (const soal of soalData) {
				const res = await fetch(`/api/elearning/jawaban-esai/soal/${soal.id}`);
				if (res.ok) {
					const data = await res.json();
					jawabanMap.set(soal.id, data);
					setFormData((prev) => ({
						...prev,
						[soal.id]: data.jawaban || "",
					}));
					if (data.jawaban) hasSubmitted = true;
				}
			}

			setJawabanMap(jawabanMap);
			setSubmitted(hasSubmitted);
		} catch (error) {
			console.error("Error fetching jawaban:", error);
		}
	};

	const handleAnswerChange = (soalId: number, jawaban: string) => {
		setFormData((prev) => ({
			...prev,
			[soalId]: jawaban,
		}));
	};

	const handleSubmitAll = async () => {
		// Validate all answers
		const allAnswered = soalList.every((soal) => formData[soal.id]?.trim());
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

			// Submit all answers
			const submitPromises = soalList.map((soal) =>
				fetch("/api/elearning/jawaban-esai", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						soalEsaiId: soal.id,
						jawaban: formData[soal.id],
					}),
				}),
			);

			const results = await Promise.all(submitPromises);
			const allSuccess = results.every((res) => res.ok);

			if (!allSuccess) {
				throw new Error("Beberapa jawaban gagal disubmit");
			}

			showSuccess("Semua jawaban berhasil disubmit!");
			setSubmitted(true);
			await fetchKuisDetail();
		} catch (error) {
			showError("Gagal mensubmit jawaban");
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	const formatDate = (dateStr: string) => {
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

	if (!kuis) {
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

	const allAnswered = soalList.every((soal) => formData[soal.id]?.trim());

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
						{kuis.judulTugas}
					</h1>
					{kuis.materi && (
						<p className="text-gray-600">Materi: {kuis.materi.judulMateri}</p>
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
								{soalList.length}
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
								{formatDate(kuis.tanggalBuka)}
							</div>
						</div>
						<div>
							<div className="text-sm font-semibold text-gray-700 mb-1">
								Deadline
							</div>
							<div className="text-gray-600 text-sm">
								{formatDate(kuis.tanggalDeadline)}
							</div>
						</div>
					</div>
				</div>

				{/* Deskripsi */}
				{kuis.deskripsi && (
					<div className="bg-white rounded-lg shadow p-6 mb-8">
						<h2 className="text-lg font-bold text-gray-900 mb-4">Instruksi</h2>
						<p className="text-gray-700 whitespace-pre-wrap">
							{kuis.deskripsi}
						</p>
					</div>
				)}

				{/* Soal Essay */}
				<div className="space-y-6">
					{soalList.map((soal, index) => {
						const jawaban = jawabanMap.get(soal.id);
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
					<div className="mt-8 p-6 bg-green-50 rounded-lg border-l-4 border-green-600">
						<h3 className="text-lg font-bold text-green-900 mb-2">
							Jawaban Berhasil Disubmit
						</h3>
						<p className="text-green-700">
							Guru akan mengoreksi jawaban Anda. Anda akan menerima notifikasi
							ketika nilai sudah diinputkan.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
