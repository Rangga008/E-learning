"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/hooks/useNotification";
import { apiClient } from "@/utils/apiClient";

interface Tugas {
	id: number;
	judulTugas: string;
	deskripsi: string;
	tipeSubmisi: string[];
	tanggalBuka: string;
	tanggalDeadline: string;
	nilaiMaksimal: number;
	materi?: {
		id: number;
		judulMateri: string;
	};
}

interface JawabanTugas {
	id: number;
	filePath: string;
	tipeFile: string;
	fileName: string;
	createdAt: string;
	nilai: number | null;
	feedback?: string;
	isLate: boolean;
}

export default function SiswaSubmitTugasPage() {
	const params = useParams();
	const router = useRouter();
	const { showSuccess, showError } = useNotification();
	const tugasId = Number(params.tugasId);
	const materiId = Number(params.id);

	const [tugas, setTugas] = useState<Tugas | null>(null);
	const [jawaban, setJawaban] = useState<JawabanTugas | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState("");
	const [deadline, setDeadline] = useState<Date | null>(null);
	const [isLate, setIsLate] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const fetchJawaban = useCallback(async () => {
		try {
			// Try to fetch jawaban for this task
			const res = await apiClient.get(`/elearning/tugas/${tugasId}`);
			// If tugas has jawaban data embedded
			if (res.data.jawaban && res.data.jawaban.length > 0) {
				setJawaban(res.data.jawaban[0]);
			}
		} catch (error) {
			// Silently fail - jawaban might not exist yet
			console.log("No jawaban found for this task");
		}
	}, [tugasId]);

	const fetchTugasDetail = useCallback(async () => {
		try {
			setLoading(true);
			const res = await apiClient.get(`/elearning/tugas/${tugasId}`);
			setTugas(res.data);

			// Check if deadline has passed
			const deadlineDate = new Date(res.data.tanggalDeadline);
			setDeadline(deadlineDate);
			setIsLate(new Date() > deadlineDate);

			// Fetch jawaban siswa
			await fetchJawaban();
		} catch (error) {
			showError("Gagal memuat detail tugas");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [tugasId, showError, fetchJawaban]);

	useEffect(() => {
		fetchTugasDetail();
	}, [fetchTugasDetail]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			setSelectedFile(null);
			return;
		}

		// Validate file size (max 10MB) - accept any format
		if (file.size > 10 * 1024 * 1024) {
			setFileError("Ukuran file tidak boleh lebih dari 10MB");
			setSelectedFile(null);
			return;
		}

		setFileError("");
		setSelectedFile(file);
	};

	const handleSubmit = async () => {
		if (!selectedFile) {
			setFileError("Pilih file untuk diupload");
			return;
		}

		try {
			setSubmitting(true);
			const formData = new FormData();
			formData.append("file", selectedFile);
			formData.append("tugasId", String(tugasId));

			const res = await apiClient.post("/elearning/jawaban/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (res.status === 201 || res.status === 200) {
				showSuccess("Jawaban tugas berhasil diupload");
				setSelectedFile(null);
				setFileError("");
				// Update jawaban state with new data
				setJawaban(res.data.data);
				// Refresh parent pages to update progress bar
				setTimeout(() => {
					router.refresh();
				}, 1000);
			}
		} catch (error: any) {
			if (error.response?.status === 409) {
				showError("Anda sudah memiliki jawaban untuk tugas ini");
			} else {
				showError("Gagal mengupload jawaban");
			}
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditSubmit = async () => {
		if (!selectedFile || !jawaban) {
			setFileError("Pilih file untuk diupload");
			return;
		}

		try {
			setSubmitting(true);
			const formData = new FormData();
			formData.append("file", selectedFile);

			const res = await apiClient.put(
				`/elearning/jawaban/${jawaban.id}/upload`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);

			if (res.status === 200) {
				showSuccess("File jawaban berhasil diperbarui");
				setSelectedFile(null);
				setFileError("");
				setIsEditing(false);
				// Update jawaban state with new data
				setJawaban(res.data.data);
				// Refresh to update
				setTimeout(() => {
					router.refresh();
				}, 500);
			}
		} catch (error: any) {
			showError("Gagal mengupdate file jawaban");
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDownload = async () => {
		if (!jawaban) return;

		try {
			const response = await apiClient.get(
				`/elearning/jawaban/${jawaban.id}/download`,
				{
					responseType: "blob",
				},
			);

			// Create blob and download
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", jawaban.fileName || "jawaban");
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			showError("Gagal mengunduh file");
			console.error(error);
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

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!tugas) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Tugas tidak ditemukan
					</h1>
					<Link
						href={`/siswa/elearning/materi/${materiId}`}
						className="text-blue-600 hover:text-blue-700"
					>
						Kembali ke materi
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between mb-4">
						<Link
							href={`/siswa/elearning/materi/${materiId}`}
							className="text-blue-600 hover:text-blue-700"
						>
							← Kembali ke Materi
						</Link>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{tugas.judulTugas}
					</h1>
					{tugas.materi && (
						<p className="text-gray-600">Materi: {tugas.materi.judulMateri}</p>
					)}
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Status Cards */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<div className="bg-white rounded-lg shadow p-4">
						<div className="text-sm text-gray-600 mb-1">Nilai Maksimal</div>
						<div className="text-2xl font-bold text-blue-600">
							{tugas.nilaiMaksimal}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow p-4">
						<div className="text-sm text-gray-600 mb-1">Status</div>
						<div
							className={`text-lg font-semibold ${
								jawaban ? "text-green-600" : "text-orange-600"
							}`}
						>
							{jawaban ? "Sudah Upload" : "Belum Upload"}
						</div>
					</div>
					{jawaban && jawaban.nilai !== null && (
						<div className="bg-white rounded-lg shadow p-4">
							<div className="text-sm text-gray-600 mb-1">Nilai Kamu</div>
							<div className="text-2xl font-bold text-green-600">
								{jawaban.nilai}
							</div>
						</div>
					)}
					<div className="bg-white rounded-lg shadow p-4">
						<div className="text-sm text-gray-600 mb-1">Batas Waktu</div>
						<div
							className={`text-sm font-semibold ${
								isLate ? "text-red-600" : "text-gray-600"
							}`}
						>
							{isLate ? "Terlambat" : "Tepat Waktu"}
						</div>
					</div>
				</div>

				{/* Deskripsi Tugas */}
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						Deskripsi Tugas
					</h2>
					<div className="prose prose-sm max-w-none">
						<p className="text-gray-700 whitespace-pre-wrap">
							{tugas.deskripsi}
						</p>
					</div>

					<div className="mt-6 grid grid-cols-2 gap-4">
						<div>
							<div className="text-sm font-semibold text-gray-700 mb-1">
								Tanggal Dibuka
							</div>
							<div className="text-gray-600">
								{formatDate(tugas.tanggalBuka)}
							</div>
						</div>
						<div>
							<div className="text-sm font-semibold text-gray-700 mb-1">
								Deadline
							</div>
							<div className={isLate ? "text-red-600" : "text-gray-600"}>
								{formatDate(tugas.tanggalDeadline)}
							</div>
						</div>
					</div>
				</div>

				{/* Upload Section */}
				{!jawaban ? (
					<div className="bg-white rounded-lg shadow p-6 mb-8">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Upload Jawaban
						</h2>

						{/* Format Accepted */}
						<div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
							<div className="text-sm font-semibold text-blue-900 mb-2">
								Format yang diterima:
							</div>
							<div className="text-blue-700 text-sm">
								Semua format file diterima (PDF, Word, Excel, Gambar, Text, dll)
							</div>
							<p className="text-xs text-blue-700 mt-2">
								Ukuran maksimal: 10MB
							</p>
						</div>

						{/* File Input */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Pilih File
							</label>
							<div className="relative">
								<input
									type="file"
									onChange={handleFileChange}
									className="block w-full text-sm text-gray-500
										file:mr-4 file:py-2 file:px-4
										file:rounded-md file:border-0
										file:text-sm file:font-semibold
										file:bg-blue-50 file:text-blue-700
										hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg"
									disabled={submitting}
								/>
							</div>
							{fileError && (
								<p className="mt-2 text-sm text-red-600">{fileError}</p>
							)}
						</div>

						{/* Selected File Preview */}
						{selectedFile && (
							<div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-900">
											{selectedFile.name}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											Ukuran: {formatFileSize(selectedFile.size)}
										</p>
									</div>
									<button
										onClick={() => {
											setSelectedFile(null);
											setFileError("");
										}}
										className="text-red-600 hover:text-red-700 font-bold"
										type="button"
									>
										✕
									</button>
								</div>
							</div>
						)}

						{/* Submit Button */}
						<button
							onClick={handleSubmit}
							disabled={!selectedFile || submitting}
							className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
								!selectedFile || submitting
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{submitting ? "Sedang diupload..." : "Upload Jawaban"}
						</button>
					</div>
				) : null}

				{/* Previous Submission */}
				{jawaban && (
					<div className="bg-white rounded-lg shadow p-6 mb-8">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold text-gray-900">
								Submission Terakhir
							</h2>
							{!isEditing && (
								<button
									onClick={() => setIsEditing(true)}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
								>
									Edit File
								</button>
							)}
						</div>

						{isEditing ? (
							<div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Ganti File
								</h3>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Pilih File Baru
									</label>
									<div className="relative">
										<input
											type="file"
											onChange={handleFileChange}
											className="block w-full text-sm text-gray-500
												file:mr-4 file:py-2 file:px-4
												file:rounded-md file:border-0
												file:text-sm file:font-semibold
												file:bg-blue-50 file:text-blue-700
												hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg"
											disabled={submitting}
										/>
									</div>
									{fileError && (
										<p className="mt-2 text-sm text-red-600">{fileError}</p>
									)}
								</div>

								{/* Selected File Preview */}
								{selectedFile && (
									<div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-gray-900">
													{selectedFile.name}
												</p>
												<p className="text-xs text-gray-500 mt-1">
													Ukuran: {formatFileSize(selectedFile.size)}
												</p>
											</div>
											<button
												onClick={() => {
													setSelectedFile(null);
													setFileError("");
												}}
												className="text-red-600 hover:text-red-700 font-bold"
												type="button"
											>
												✕
											</button>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex gap-3">
									<button
										onClick={handleEditSubmit}
										disabled={!selectedFile || submitting}
										className={`flex-1 py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
											!selectedFile || submitting
												? "bg-gray-400 cursor-not-allowed"
												: "bg-green-600 hover:bg-green-700"
										}`}
									>
										{submitting ? "Sedang diupload..." : "Simpan File Baru"}
									</button>
									<button
										onClick={() => {
											setIsEditing(false);
											setSelectedFile(null);
											setFileError("");
										}}
										disabled={submitting}
										className="flex-1 py-2 px-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
									>
										Batal
									</button>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div>
									<div className="text-sm font-semibold text-gray-700 mb-1">
										File
									</div>
									<div className="flex items-center gap-3">
										<span className="text-gray-600">{jawaban.fileName}</span>
										<button
											onClick={handleDownload}
											className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold transition-colors"
										>
											Download
										</button>
									</div>
								</div>

								<div>
									<div className="text-sm font-semibold text-gray-700 mb-1">
										Waktu Submisi
									</div>
									<div className="text-gray-600">
										{formatDate(jawaban.createdAt)}
									</div>
								</div>

								{jawaban.nilai !== null && (
									<div className="p-4 bg-green-50 rounded-lg border border-green-200">
										<div className="text-sm font-semibold text-gray-700 mb-2">
											Nilai
										</div>
										<div className="text-3xl font-bold text-green-600 mb-4">
											{jawaban.nilai}
										</div>
										{jawaban.feedback && (
											<>
												<div className="text-sm font-semibold text-gray-700 mb-2">
													Umpan Balik
												</div>
												<p className="text-gray-700 whitespace-pre-wrap">
													{jawaban.feedback}
												</p>
											</>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
