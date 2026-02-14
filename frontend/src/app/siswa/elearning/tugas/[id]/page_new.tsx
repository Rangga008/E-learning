"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/hooks/useNotification";

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
	createdAt: string;
	nilai: number | null;
	feedback?: string;
	isLate: boolean;
}

export default function SiswaSubmitTugasPage() {
	const params = useParams();
	const router = useRouter();
	const { showSuccess, showError } = useNotification();
	const tugasId = Number(params.id);

	const [tugas, setTugas] = useState<Tugas | null>(null);
	const [jawaban, setJawaban] = useState<JawabanTugas | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState("");
	const [deadline, setDeadline] = useState<Date | null>(null);
	const [isLate, setIsLate] = useState(false);

	const fetchJawaban = useCallback(async () => {
		try {
			const res = await fetch(`/api/elearning/tugas/${tugasId}/jawaban-siswa`);
			if (res.ok) {
				const data = await res.json();
				setJawaban(data);
			}
		} catch (error) {
			console.error("Error fetching jawaban:", error);
		}
	}, [tugasId]);

	const fetchTugasDetail = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/elearning/tugas/${tugasId}`);
			if (!res.ok) throw new Error("Gagal memuat detail tugas");
			const data = await res.json();
			setTugas(data);

			// Check if deadline has passed
			const deadlineDate = new Date(data.tanggalDeadline);
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

		// Validate file size only (max 10MB) - accept any format
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
			formData.append("tipeFile", selectedFile.type);

			const res = await fetch("/api/elearning/jawaban-tugas/submit", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) throw new Error("Gagal upload jawaban");

			showSuccess("Jawaban tugas berhasil diupload");
			setSelectedFile(null);
			setFileError("");
			await fetchJawaban();
		} catch (error) {
			showError("Gagal mengupload jawaban");
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
						href="/siswa/elearning"
						className="text-blue-600 hover:text-blue-700"
					>
						Kembali ke daftar materi
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
							href={
								tugas?.materi
									? `/siswa/elearning/materi/${tugas.materi.id}`
									: "/siswa/elearning"
							}
							className="text-blue-600 hover:text-blue-700"
						>
							← Kembali
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
						<p className="text-xs text-blue-700 mt-2">Ukuran maksimal: 10MB</p>
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
			</div>
		</div>
	);
}
