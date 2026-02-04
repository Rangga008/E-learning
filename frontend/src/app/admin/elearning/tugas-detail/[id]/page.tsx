"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import {
	SuccessToast,
	ErrorToast,
	ConfirmModal,
} from "@/components/CommonModals";

interface Tugas {
	id: number;
	materiId: number;
	judulTugas: string;
	deskripsi: string;
	tipe: string;
	tanggalBuka: string;
	tanggalDeadline: string;
	status: string;
	nilaiMaksimal: number;
	tipeSubmisi: string[];
	guru?: { nama: string; user?: { email: string } };
}

interface JawabanTugas {
	id: number;
	pesertaDidikId: number;
	jawabanTeks?: string;
	filePath?: string;
	statusSubmisi: string;
	submittedAt?: string;
	isLate: boolean;
	pesertaDidik?: {
		id: number;
		nama: string;
		noInduk: string;
		user?: { email: string };
	};
}

interface NilaiTugas {
	id: number;
	jawabanId: number;
	nilai: number;
	feedback?: string;
	createdAt: string;
}

export default function AdminTugasDetailPage() {
	const params = useParams();
	const router = useRouter();
	const tugasId = params.id as string;
	const token = useAuthStore((state) => state.token);

	const {
		successToast,
		errorToast,
		showSuccess,
		showError,
		closeSuccess,
		closeError,
	} = useNotification();

	const [tugas, setTugas] = useState<Tugas | null>(null);
	const [jawabanList, setJawabanList] = useState<JawabanTugas[]>([]);
	const [nilaiMap, setNilaiMap] = useState<Record<number, NilaiTugas>>({});
	const [loading, setLoading] = useState(true);
	const [savingNilai, setSavingNilai] = useState<Record<number, boolean>>({});
	const [gradiNilai, setGradiNilai] = useState<Record<number, string>>({});
	const [gradiFeedback, setGradiFeedback] = useState<Record<number, string>>(
		{},
	);

	const fetchTugasDetail = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat detail tugas");
				return;
			}

			const data = await response.json();
			setTugas(data.data || data);
		} catch (error) {
			console.error("Error loading tugas detail:", error);
			showError("Terjadi kesalahan saat memuat tugas");
		}
	}, [tugasId, token, showError]);

	const fetchJawabanTugas = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/admin/tugas/${tugasId}/jawaban`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) {
				showError("Gagal memuat jawaban siswa");
				return;
			}

			const data = await response.json();
			const list = Array.isArray(data) ? data : data.data || [];
			setJawabanList(list);

			// Fetch nilai untuk setiap jawaban
			const nilaiData: Record<number, NilaiTugas> = {};
			for (const jawaban of list) {
				try {
					const nilaiRes = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/elearning/jawaban-tugas/${jawaban.id}/nilai`,
						{
							headers: { Authorization: `Bearer ${token}` },
						},
					);
					if (nilaiRes.ok) {
						const nilai = await nilaiRes.json();
						nilaiData[jawaban.id] = nilai.data || nilai;
						setGradiNilai((prev) => ({
							...prev,
							[jawaban.id]: String(nilai.data?.nilai || nilai?.nilai || ""),
						}));
						setGradiFeedback((prev) => ({
							...prev,
							[jawaban.id]: nilai.data?.feedback || nilai?.feedback || "",
						}));
					}
				} catch (error) {
					console.error(
						`Error loading nilai for jawaban ${jawaban.id}:`,
						error,
					);
				}
			}
			setNilaiMap(nilaiData);
		} catch (error) {
			console.error("Error loading jawaban tugas:", error);
			showError("Terjadi kesalahan saat memuat jawaban");
		}
	}, [tugasId, token, showError]);

	useEffect(() => {
		if (!token) return;
		fetchTugasDetail();
		fetchJawabanTugas();
	}, [token, tugasId, fetchTugasDetail, fetchJawabanTugas]);

	const handleSaveNilai = async (jawabanId: number) => {
		if (!gradiNilai[jawabanId] || parseInt(gradiNilai[jawabanId]) < 0) {
			showError("Nilai tidak valid");
			return;
		}

		setSavingNilai((prev) => ({ ...prev, [jawabanId]: true }));
		try {
			const payload = {
				jawabanTugasId: jawabanId,
				nilai: parseInt(gradiNilai[jawabanId]),
				feedback: gradiFeedback[jawabanId] || "",
			};

			const isUpdate = nilaiMap[jawabanId]?.id;
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/jawaban-tugas/${jawabanId}/nilai`,
				{
					method: isUpdate ? "PUT" : "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				showError("Gagal menyimpan nilai");
				return;
			}

			showSuccess("Nilai berhasil disimpan");
			fetchJawabanTugas();
		} catch (error) {
			console.error("Error saving nilai:", error);
			showError("Terjadi kesalahan saat menyimpan nilai");
		} finally {
			setSavingNilai((prev) => ({ ...prev, [jawabanId]: false }));
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!tugas) {
		return (
			<div className="p-6">
				<div className="text-center">
					<p className="text-gray-500 mb-4">Tugas tidak ditemukan</p>
					<Link
						href="/admin/elearning"
						className="text-blue-600 hover:underline"
					>
						← Kembali ke E-Learning
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6 flex justify-between items-start">
					<div>
						<Link
							href="/admin/elearning"
							className="text-blue-600 hover:underline text-sm mb-3 inline-block"
						>
							← Kembali ke E-Learning
						</Link>
						<h1 className="text-3xl font-bold text-gray-800">
							{tugas.judulTugas}
						</h1>
						<div className="flex gap-2 mt-2">
							<span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded">
								TUGAS
							</span>
							<span
								className={`text-xs font-semibold px-3 py-1 rounded ${
									tugas.status === "PUBLISHED"
										? "bg-green-100 text-green-800"
										: tugas.status === "DRAFT"
										? "bg-yellow-100 text-yellow-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								{tugas.status}
							</span>
						</div>
					</div>
				</div>

				{/* Tugas Info */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
					<div className="grid grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-gray-600">Deskripsi</p>
							<p className="text-gray-800">{tugas.deskripsi}</p>
						</div>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-gray-600">Guru</p>
								<p className="text-gray-800">{tugas.guru?.nama}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Tanggal Dibuka</p>
								<p className="text-gray-800">
									{new Date(tugas.tanggalBuka).toLocaleDateString("id-ID", {
										dateStyle: "long",
										timeStyle: "short",
									})}
								</p>
							</div>
							{tugas.tanggalDeadline && (
								<div>
									<p className="text-sm text-gray-600">Deadline</p>
									<p className="text-gray-800">
										{new Date(tugas.tanggalDeadline).toLocaleDateString(
											"id-ID",
											{
												dateStyle: "long",
												timeStyle: "short",
											},
										)}
									</p>
								</div>
							)}
							<div>
								<p className="text-sm text-gray-600">Nilai Maksimal</p>
								<p className="text-gray-800">{tugas.nilaiMaksimal}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Jawaban Siswa */}
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-bold mb-4">
						Jawaban Siswa ({jawabanList.length})
					</h2>

					{jawabanList.length > 0 ? (
						<div className="space-y-4">
							{jawabanList.map((jawaban) => (
								<div
									key={jawaban.id}
									className="border border-gray-200 rounded-lg p-4"
								>
									<div className="flex justify-between items-start mb-3">
										<div>
											<p className="font-semibold text-gray-800">
												{jawaban.pesertaDidik?.nama}
											</p>
											<p className="text-sm text-gray-600">
												{jawaban.pesertaDidik?.noInduk}
											</p>
										</div>
										<span
											className={`text-xs font-semibold px-3 py-1 rounded ${
												jawaban.statusSubmisi === "SUBMITTED"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{jawaban.statusSubmisi}
										</span>
									</div>

									{jawaban.submittedAt && (
										<p className="text-sm text-gray-600 mb-2">
											Dikumpulkan:{" "}
											{new Date(jawaban.submittedAt).toLocaleDateString(
												"id-ID",
												{
													dateStyle: "short",
													timeStyle: "short",
												},
											)}
											{jawaban.isLate && (
												<span className="text-red-600 font-semibold ml-2">
													(TERLAMBAT)
												</span>
											)}
										</p>
									)}

									{/* Jawaban Content */}
									<div className="bg-gray-50 rounded p-3 mb-3">
										{jawaban.jawabanTeks && (
											<div className="mb-3">
												<p className="text-sm font-semibold text-gray-700 mb-1">
													Jawaban Teks:
												</p>
												<p className="text-gray-700 whitespace-pre-wrap">
													{jawaban.jawabanTeks}
												</p>
											</div>
										)}
										{jawaban.filePath && (
											<div>
												<p className="text-sm font-semibold text-gray-700 mb-1">
													File Jawaban:
												</p>
												<a
													href={`${process.env.NEXT_PUBLIC_API_URL}/${jawaban.filePath}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline text-sm flex items-center gap-1"
												>
													📎 {jawaban.filePath.split("/").pop()}
												</a>
											</div>
										)}
									</div>

									{/* Grading */}
									<div className="space-y-3 border-t border-gray-200 pt-3">
										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Nilai
												</label>
												<input
													type="number"
													min="0"
													max={tugas.nilaiMaksimal}
													value={gradiNilai[jawaban.id] || ""}
													onChange={(e) =>
														setGradiNilai((prev) => ({
															...prev,
															[jawaban.id]: e.target.value,
														}))
													}
													placeholder="Masukkan nilai"
													className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Feedback
												</label>
												<input
													type="text"
													value={gradiFeedback[jawaban.id] || ""}
													onChange={(e) =>
														setGradiFeedback((prev) => ({
															...prev,
															[jawaban.id]: e.target.value,
														}))
													}
													placeholder="Feedback singkat"
													className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
												/>
											</div>
										</div>
										<button
											onClick={() => handleSaveNilai(jawaban.id)}
											disabled={savingNilai[jawaban.id]}
											className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
										>
											{savingNilai[jawaban.id]
												? "Menyimpan..."
												: "Simpan Nilai"}
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							Belum ada jawaban siswa
						</div>
					)}
				</div>
			</div>

			<SuccessToast
				isOpen={successToast.isOpen}
				message={successToast.message}
				onClose={closeSuccess}
			/>
			<ErrorToast
				isOpen={errorToast.isOpen}
				message={errorToast.message}
				onClose={closeError}
			/>
		</div>
	);
}
