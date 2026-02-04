"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";

interface Tugas {
	id: number;
	materiId: number;
	judulTugas: string;
	deskripsi: string;
	tipe: "UPLOAD" | "ESAI";
	deadline?: string;
	status: string;
	createdAt: string;
	filePath?: string;
	fileName?: string;
	fileType?: string;
}

interface SoalEsai {
	id: number;
	tugasId: number;
	pertanyaan: string;
	bobot: number;
	createdAt: string;
}

interface JawabanEsai {
	id: number;
	pesertaDidikId: number;
	soalEsaiId: number;
	jawaban: string;
	nilai?: number;
	sudahDinilai: boolean;
	catatanGuru?: string;
	createdAt: string;
	pesertaDidik?: {
		id: number;
		namaLengkap: string;
		nisn: string;
	};
	soal?: SoalEsai;
}

interface StudentSubmission {
	pesertaDidikId: number;
	namaLengkap: string;
	nisn: string;
	soalJawaban: JawabanEsai[];
	totalNilai?: number;
	sudahDinilaiSemua: boolean;
}

export default function GuruKuisDetailPage() {
	const params = useParams();
	const router = useRouter();
	const materiId = params.id as string;
	const tugasId = params.tugasId as string;
	const { user } = useAuthStore();
	const { showSuccess, showError } = useNotification();

	// State
	const [tugas, setTugas] = useState<Tugas | null>(null);
	const [soalList, setSoalList] = useState<SoalEsai[]>([]);
	const [studentSubmissions, setStudentSubmissions] = useState<
		StudentSubmission[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [filteredSubmissions, setFilteredSubmissions] = useState<
		StudentSubmission[]
	>([]);
	const [filterStatus, setFilterStatus] = useState<
		"all" | "graded" | "pending"
	>("all");

	// Soal Form State
	const [showSoalModal, setShowSoalModal] = useState(false);
	const [soalForm, setSoalForm] = useState({
		pertanyaan: "",
		bobot: "0",
	});
	const [savingSoal, setSavingSoal] = useState(false);

	// Edit Soal State
	const [editingSoalId, setEditingSoalId] = useState<number | null>(null);
	const [editSoalForm, setEditSoalForm] = useState({
		pertanyaan: "",
		bobot: "0",
	});

	// File Upload State
	const [uploadingFile, setUploadingFile] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// Grading State
	const [showGradingModal, setShowGradingModal] = useState(false);
	const [selectedStudent, setSelectedStudent] =
		useState<StudentSubmission | null>(null);
	const [gradingForm, setGradingForm] = useState<
		Record<number, { nilai: string; catatan: string }>
	>({});
	const [savingGrade, setSavingGrade] = useState(false);

	// Settings State
	const [kuisVisible, setKuisVisible] = useState(true);
	const [editingTugas, setEditingTugas] = useState(false);
	const [tugasEditForm, setTugasEditForm] = useState({
		judulTugas: "",
		deskripsi: "",
		deadline: "",
	});
	const [savingTugasEdit, setSavingTugasEdit] = useState(false);
	const [savingStatus, setSavingStatus] = useState(false);

	// Load Data
	const loadKuisDetail = useCallback(async () => {
		try {
			setLoading(true);
			console.log(
				"🔄 Loading kuis detail for tugasId:",
				tugasId,
				"materiId:",
				materiId,
			);

			// Load tugas - FIX: Use tugasId directly, not materiId
			const tugasResponse = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			if (!tugasResponse.ok) {
				throw new Error("Gagal memuat tugas");
			}

			const tugasData = await tugasResponse.json();
			console.log("📚 Tugas data loaded:", tugasData);
			setTugas(tugasData);
			setTugasEditForm({
				judulTugas: tugasData.judulTugas,
				deskripsi: tugasData.deskripsi,
				deadline: tugasData.deadline || "",
			});

			// Load soal esai
			try {
				console.log("🔍 Loading soal esai for tugasId:", tugasId);
				const soalResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/soal-esai/tugas/${tugasId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);

				if (soalResponse.ok) {
					const soalData = await soalResponse.json();
					console.log("📝 Soal data loaded:", soalData);
					// Handle both response formats: {data: [...]} or just [...]
					const soalList = soalData.data || soalData;
					setSoalList(Array.isArray(soalList) ? soalList : []);
				} else {
					console.warn("⚠️ Failed to load soal:", soalResponse.status);
				}
			} catch (error) {
				console.error("❌ Error loading soal:", error);
			}

			// Load submissions (endpoint may not exist yet on backend)
			try {
				console.log("👥 Loading submissions for tugasId:", tugasId);
				const submissionsResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/jawaban-esai/tugas/${tugasId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);

				if (submissionsResponse.ok) {
					const data = await submissionsResponse.json();
					console.log("✅ Submissions loaded:", data);
					// Handle both response formats: {data: [...]} or just [...]
					const submissionsList = data.data || data;
					setStudentSubmissions(
						Array.isArray(submissionsList) ? submissionsList : [],
					);
				} else if (submissionsResponse.status === 404) {
					console.warn("⚠️ Submissions endpoint not found (404)");
					// Endpoint not yet implemented - set empty submissions
					setStudentSubmissions([]);
				} else {
					console.warn(
						"⚠️ Unexpected response status:",
						submissionsResponse.status,
					);
				}
			} catch (error) {
				console.error("❌ Error loading submissions:", error);
				// Silently fail - endpoint may not exist yet
				setStudentSubmissions([]);
			}
		} catch (error: any) {
			console.error("🚨 Error in loadKuisDetail:", error);
			showError("Error loading kuis details");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [tugasId, showError]);

	useEffect(() => {
		if (tugasId && user) {
			loadKuisDetail();
		}
	}, [tugasId, user, loadKuisDetail]);

	const filterSubmissions = useCallback(() => {
		let filtered = studentSubmissions;

		if (filterStatus === "graded") {
			filtered = filtered.filter((s) => s.sudahDinilaiSemua);
		} else if (filterStatus === "pending") {
			filtered = filtered.filter((s) => !s.sudahDinilaiSemua);
		}

		setFilteredSubmissions(filtered);
	}, [studentSubmissions, filterStatus]);

	useEffect(() => {
		filterSubmissions();
	}, [filterSubmissions]);

	// ============= SOAL HANDLERS =============
	const handleAddSoal = () => {
		setSoalForm({
			pertanyaan: "",
			bobot: "0",
		});
		setShowSoalModal(true);
	};

	const handleSaveSoal = async () => {
		if (!soalForm.pertanyaan.trim()) {
			showError("Pertanyaan tidak boleh kosong");
			return;
		}

		const bobotNum = parseInt(soalForm.bobot);
		if (isNaN(bobotNum) || bobotNum <= 0) {
			showError("Bobot harus berupa angka positif");
			return;
		}

		try {
			setSavingSoal(true);

			const payload = {
				materiId: parseInt(materiId),
				tugasId: parseInt(tugasId),
				pertanyaan: soalForm.pertanyaan,
				bobot: bobotNum,
			};

			console.log("📝 Sending soal payload:", payload);
			console.log(
				"🔗 API URL:",
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/soal-esai`,
			);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/soal-esai`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify(payload),
				},
			);

			console.log("📊 Response status:", response.status);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("❌ Error response:", errorData);
				throw new Error(`Failed to create soal: ${response.statusText}`);
			}

			const result = await response.json();
			console.log("✅ Soal created successfully:", result);

			const newSoal = result.data || result;

			// Optimistic update: add new soal to list immediately
			setSoalList((prevList) => [...prevList, newSoal]);

			showSuccess("Soal berhasil dibuat");
			setShowSoalModal(false);
			setSoalForm({ pertanyaan: "", bobot: "0" });
		} catch (error: any) {
			console.error("🚨 Error in handleSaveSoal:", error);
			showError(error.message || "Error creating soal");
		} finally {
			setSavingSoal(false);
		}
	};

	const handleEditSoal = (soal: SoalEsai) => {
		setEditingSoalId(soal.id);
		setEditSoalForm({
			pertanyaan: soal.pertanyaan,
			bobot: soal.bobot.toString(),
		});
	};

	const handleSaveEditSoal = async () => {
		if (!editSoalForm.pertanyaan.trim()) {
			showError("Pertanyaan tidak boleh kosong");
			return;
		}

		const bobotNum = parseInt(editSoalForm.bobot);
		if (isNaN(bobotNum) || bobotNum <= 0) {
			showError("Bobot harus berupa angka positif");
			return;
		}

		if (!editingSoalId) return;

		try {
			setSavingSoal(true);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/soal-esai/${editingSoalId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						pertanyaan: editSoalForm.pertanyaan,
						bobot: bobotNum,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Gagal mengupdate soal");
			}

			const result = await response.json();
			const updatedSoal = result.data || result;

			// Optimistic update: update soal in list
			setSoalList((prevList) =>
				prevList.map((s) => (s.id === editingSoalId ? updatedSoal : s)),
			);

			showSuccess("Soal berhasil diupdate");
			setEditingSoalId(null);
			setEditSoalForm({ pertanyaan: "", bobot: "0" });
		} catch (error: any) {
			console.error("🚨 Error in handleSaveEditSoal:", error);
			showError(error.message || "Error updating soal");
		} finally {
			setSavingSoal(false);
		}
	};

	const handleCancelEditSoal = () => {
		setEditingSoalId(null);
		setEditSoalForm({ pertanyaan: "", bobot: "0" });
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"image/jpeg",
			"image/png",
			"image/jpg",
		];

		if (!allowedTypes.includes(file.type)) {
			showError("File harus berupa PDF, Word, atau Foto");
			return;
		}

		// Validate file size (max 20MB)
		if (file.size > 20 * 1024 * 1024) {
			showError("File terlalu besar (max 20MB)");
			return;
		}

		try {
			setUploadingFile(true);
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}/upload`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: formData,
				},
			);

			const result = await response.json();
			console.log("📤 File upload response:", result);

			if (!response.ok) {
				console.error("❌ Upload error details:", result);
				throw new Error(result?.message || "Gagal mengupload file");
			}

			// Response wrapped in {data: tugas}
			const updatedTugas = result.data || result;
			console.log("📝 Updated tugas data:", updatedTugas);

			setTugas((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					filePath: updatedTugas.filePath,
					fileName: updatedTugas.fileName,
					fileType: updatedTugas.fileType,
				};
			});

			setSelectedFile(null);
			showSuccess("File berhasil diupload");
		} catch (error: any) {
			console.error("🚨 File upload error:", error);
			showError(error.message || "Error uploading file");
		} finally {
			setUploadingFile(false);
		}
	};

	const handleDeleteFile = async () => {
		if (!window.confirm("Apakah Anda yakin ingin menghapus file ini?")) return;

		try {
			setUploadingFile(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						filePath: null,
						fileName: null,
						fileType: null,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Gagal menghapus file");
			}

			setTugas(
				(prev) =>
					({
						...prev,
						filePath: undefined,
						fileName: undefined,
						fileType: undefined,
					} as Tugas),
			);

			showSuccess("File berhasil dihapus");
		} catch (error: any) {
			showError(error.message || "Error deleting file");
		} finally {
			setUploadingFile(false);
		}
	};

	const handleDeleteSoal = async (soalId: number) => {
		if (!window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/soal-esai/${soalId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error("Gagal menghapus soal");
			}

			// Optimistic update: remove soal from list immediately
			setSoalList((prevList) => prevList.filter((soal) => soal.id !== soalId));

			showSuccess("Soal berhasil dihapus");
		} catch (error: any) {
			showError(error.message || "Error deleting soal");
		}
	};

	// ============= GRADING HANDLERS =============
	const handleOpenGrading = (student: StudentSubmission) => {
		setSelectedStudent(student);

		// Initialize grading form with empty values
		const initialForm: Record<number, { nilai: string; catatan: string }> = {};
		student.soalJawaban.forEach((jawaban) => {
			initialForm[jawaban.id] = {
				nilai: jawaban.nilai?.toString() || "",
				catatan: jawaban.catatanGuru || "",
			};
		});
		setGradingForm(initialForm);
		setShowGradingModal(true);
	};

	const handleSaveGrades = async () => {
		if (!selectedStudent) return;

		try {
			setSavingGrade(true);
			const updatedJawaban = [...selectedStudent.soalJawaban];

			// Save each jawaban grade
			for (const jawaban of selectedStudent.soalJawaban) {
				const grade = gradingForm[jawaban.id];
				if (!grade || !grade.nilai) {
					showError(`Semua soal harus dinilai`);
					setSavingGrade(false);
					return;
				}

				const nilaiNum = parseInt(grade.nilai);
				if (isNaN(nilaiNum)) {
					showError(`Nilai harus berupa angka`);
					setSavingGrade(false);
					return;
				}

				// Grade each jawaban
				const gradeResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/elearning/jawaban-esai/${jawaban.id}/grade`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
						body: JSON.stringify({
							nilai: nilaiNum,
							catatanGuru: grade.catatan,
						}),
					},
				);

				if (!gradeResponse.ok) {
					throw new Error("Gagal menyimpan nilai");
				}

				// Optimistic update: update local jawaban with new grade
				const jawabanIndex = updatedJawaban.findIndex(
					(j) => j.id === jawaban.id,
				);
				if (jawabanIndex !== -1) {
					updatedJawaban[jawabanIndex] = {
						...updatedJawaban[jawabanIndex],
						nilai: nilaiNum,
						catatanGuru: grade.catatan,
					};
				}
			}

			// Optimistic update: update student's jawaban
			setStudentSubmissions((prevList) =>
				prevList.map((student) =>
					student.pesertaDidikId === selectedStudent.pesertaDidikId
						? { ...student, soalJawaban: updatedJawaban }
						: student,
				),
			);

			showSuccess("Semua nilai berhasil disimpan");
			setShowGradingModal(false);
		} catch (error: any) {
			showError(error.message || "Error saving grades");
		} finally {
			setSavingGrade(false);
		}
	};

	// ============= SETTINGS HANDLERS =============
	const handleToggleKuisVisibility = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						visible: !kuisVisible,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Gagal mengubah visibilitas");
			}

			setKuisVisible(!kuisVisible);
			showSuccess("Visibilitas kuis berhasil diperbarui");
		} catch (error: any) {
			showError("Error updating visibility");
		}
	};

	const handleSaveTugasEdit = async () => {
		if (!tugasEditForm.judulTugas.trim() || !tugasEditForm.deskripsi.trim()) {
			showError("Judul dan deskripsi tidak boleh kosong");
			return;
		}

		try {
			setSavingTugasEdit(true);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						judulTugas: tugasEditForm.judulTugas,
						deskripsi: tugasEditForm.deskripsi,
						deadline: tugasEditForm.deadline || null,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Gagal mengubah kuis");
			}

			showSuccess("Kuis berhasil diperbarui");
			setEditingTugas(false);
			loadKuisDetail();
		} catch (error: any) {
			showError("Error updating kuis");
		} finally {
			setSavingTugasEdit(false);
		}
	};

	const handleUpdateTugasStatus = async (newStatus: string) => {
		if (!tugas || !newStatus) return;

		setSavingStatus(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({ status: newStatus }),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Gagal mengubah status");
			}

			const data = await response.json();
			const updatedTugas = data.data || data;
			setTugas(updatedTugas);
			showSuccess(`Status kuis berhasil diubah ke ${newStatus}`);
		} catch (error: any) {
			showError(error.message || "Gagal mengubah status");
		} finally {
			setSavingStatus(false);
		}
	};

	const handleToggleTugasVisibility = async () => {
		if (!tugas) return;

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugasId}/visibility`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({ visible: !kuisVisible }),
				},
			);

			if (!response.ok) {
				throw new Error("Gagal mengubah visibilitas");
			}

			setKuisVisible(!kuisVisible);
			showSuccess(`Kuis sekarang ${!kuisVisible ? "terlihat" : "tersembunyi"}`);
		} catch (error: any) {
			showError(error.message || "Gagal mengubah visibilitas");
		}
	};

	const totalBobot = soalList.reduce((sum, soal) => sum + soal.bobot, 0);
	const gradedCount = studentSubmissions.filter(
		(s) => s.sudahDinilaiSemua,
	).length;
	const pendingCount = studentSubmissions.filter(
		(s) => !s.sudahDinilaiSemua,
	).length;

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gradient-to-r from-orange-600 to-orange-800">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
			</div>
		);
	}

	if (!tugas) {
		return (
			<div className="flex justify-center items-center h-screen bg-gradient-to-r from-orange-600 to-orange-800">
				<div className="text-white text-xl">Kuis tidak ditemukan</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 shadow-lg">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div>
						<Link
							href={`/guru/elearning/materi-detail/${materiId}`}
							className="text-orange-200 hover:text-white transition mb-2 inline-block"
						>
							← Kembali ke Materi
						</Link>
						<h1 className="text-3xl font-bold">{tugas.judulTugas}</h1>
						<p className="text-orange-100 mt-1 max-w-2xl">{tugas.deskripsi}</p>
					</div>
					<div className="text-right">
						<div className="text-sm text-orange-100 mb-2">Tipe Kuis</div>
						<div className="inline-block bg-orange-500 px-4 py-2 rounded-full text-white font-semibold">
							✍️ Essay
						</div>
					</div>
				</div>
			</div>

			{/* File Upload Section */}
			<div className="max-w-7xl mx-auto py-4 px-6">
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold text-gray-800">📎 File Kuis</h2>
						{tugas.filePath && (
							<button
								onClick={handleDeleteFile}
								disabled={uploadingFile}
								className="text-red-600 hover:text-red-800 font-semibold text-sm disabled:opacity-50"
							>
								🗑️ Hapus File
							</button>
						)}
					</div>

					{tugas.filePath ? (
						<div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg p-4">
							<div className="flex items-center gap-3">
								<span className="text-2xl">
									{tugas.fileType?.includes("pdf")
										? "📄"
										: tugas.fileType?.includes("word")
										? "📝"
										: tugas.fileType?.includes("image")
										? "🖼️"
										: "📎"}
								</span>
								<div>
									<p className="font-semibold text-gray-800">
										{tugas.fileName}
									</p>
									<p className="text-sm text-gray-600">{tugas.fileType}</p>
								</div>
							</div>
							<a
								href={`${process.env.NEXT_PUBLIC_API_URL}/elearning/tugas/${tugas.id}/download`}
								download={tugas.fileName}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
							>
								⬇️ Download
							</a>
						</div>
					) : (
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition">
							<p className="text-gray-600 mb-4">Belum ada file kuis</p>
							<label className="inline-block cursor-pointer">
								<input
									type="file"
									onChange={handleFileUpload}
									disabled={uploadingFile}
									accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
									className="hidden"
								/>
								<span className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold inline-block transition disabled:opacity-50">
									{uploadingFile ? "⏳ Uploading..." : "📤 Upload File"}
								</span>
							</label>
							<p className="text-xs text-gray-500 mt-3">
								File: PDF, Word, atau Foto (max 20MB)
							</p>
						</div>
					)}

					{tugas.filePath && (
						<div className="mt-4">
							<p className="text-sm text-gray-600 mb-3">Ganti file:</p>
							<label className="inline-block cursor-pointer">
								<input
									type="file"
									onChange={handleFileUpload}
									disabled={uploadingFile}
									accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
									className="hidden"
								/>
								<span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold inline-block transition disabled:opacity-50">
									{uploadingFile ? "⏳ Uploading..." : "📤 Ganti File"}
								</span>
							</label>
						</div>
					)}
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto py-8 px-6">
				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-600 text-sm font-semibold">
									Total Soal
								</p>
								<p className="text-3xl font-bold text-gray-800 mt-2">
									{soalList.length}
								</p>
							</div>
							<div className="text-4xl">📝</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-600 text-sm font-semibold">
									Total Bobot
								</p>
								<p className="text-3xl font-bold text-blue-600 mt-2">
									{totalBobot}
								</p>
							</div>
							<div className="text-4xl">⭐</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-600 text-sm font-semibold">
									Sudah Dinilai
								</p>
								<p className="text-3xl font-bold text-green-600 mt-2">
									{gradedCount}
								</p>
							</div>
							<div className="text-4xl">✅</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-600 text-sm font-semibold">
									Belum Dinilai
								</p>
								<p className="text-3xl font-bold text-red-600 mt-2">
									{pendingCount}
								</p>
							</div>
							<div className="text-4xl">⏳</div>
						</div>
					</div>
				</div>

				{/* Soal Section */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-gray-800">
							📝 Daftar Soal Essay
						</h2>
						<button
							onClick={handleAddSoal}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
						>
							➕ Tambah Soal
						</button>
					</div>

					{soalList.length > 0 ? (
						<div className="space-y-3">
							{soalList.map((soal, index) => (
								<div
									key={soal.id}
									className="bg-gray-50 border border-gray-300 rounded-lg p-4 hover:shadow-md transition"
								>
									{editingSoalId === soal.id ? (
										// Edit form
										<div className="space-y-4">
											<div>
												<label className="block font-semibold text-gray-700 mb-2">
													Pertanyaan
												</label>
												<textarea
													value={editSoalForm.pertanyaan}
													onChange={(e) =>
														setEditSoalForm({
															...editSoalForm,
															pertanyaan: e.target.value,
														})
													}
													rows={3}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
												/>
											</div>

											<div>
												<label className="block font-semibold text-gray-700 mb-2">
													Bobot
												</label>
												<input
													type="number"
													min="1"
													value={editSoalForm.bobot}
													onChange={(e) =>
														setEditSoalForm({
															...editSoalForm,
															bobot: e.target.value,
														})
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
												/>
											</div>

											<div className="flex gap-3">
												<button
													onClick={handleSaveEditSoal}
													disabled={savingSoal}
													className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
												>
													{savingSoal ? "💾 Menyimpan..." : "💾 Simpan"}
												</button>
												<button
													onClick={handleCancelEditSoal}
													className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
												>
													Batal
												</button>
											</div>
										</div>
									) : (
										// Display view
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<span className="font-bold text-gray-800">
														Soal {index + 1}
													</span>
													<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
														Bobot: {soal.bobot}
													</span>
												</div>
												<p className="text-gray-700">{soal.pertanyaan}</p>
											</div>
											<div className="flex gap-2 ml-4">
												<button
													onClick={() => handleEditSoal(soal)}
													className="text-blue-600 hover:text-blue-800 font-semibold"
												>
													✏️
												</button>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p className="text-lg">Belum ada soal</p>
							<p className="text-sm">
								Klik tombol &quot;Tambah Soal&quot; untuk membuat soal essay
							</p>
						</div>
					)}
				</div>

				{/* Submissions Section */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-6">
						👥 Submission Siswa
					</h2>

					{/* Filter Tabs */}
					<div className="flex gap-6 mb-6 border-b border-gray-300">
						{[
							{
								id: "all",
								label: "📋 Semua",
								count: studentSubmissions.length,
							},
							{ id: "graded", label: "✅ Sudah Dinilai", count: gradedCount },
							{ id: "pending", label: "⏳ Belum Dinilai", count: pendingCount },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setFilterStatus(tab.id as any)}
								className={`font-semibold pb-3 border-b-2 transition ${
									filterStatus === tab.id
										? "text-orange-600 border-orange-600"
										: "text-gray-600 border-transparent hover:text-gray-800"
								}`}
							>
								{tab.label} ({tab.count})
							</button>
						))}
					</div>

					{/* Submissions List */}
					{filteredSubmissions.length > 0 ? (
						<div className="space-y-3">
							{filteredSubmissions.map((student) => (
								<div
									key={student.pesertaDidikId}
									className="bg-gray-50 border border-gray-300 rounded-lg p-4 hover:shadow-md transition"
								>
									<div className="flex justify-between items-center">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<div>
													<p className="font-semibold text-gray-800">
														{student.namaLengkap}
													</p>
													<p className="text-sm text-gray-600">
														{student.nisn}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<span
													className={`text-xs px-2 py-1 rounded-full font-semibold ${
														student.sudahDinilaiSemua
															? "bg-green-100 text-green-800"
															: "bg-yellow-100 text-yellow-800"
													}`}
												>
													{student.sudahDinilaiSemua
														? "✅ Dinilai"
														: "⏳ Menunggu"}
												</span>
												{student.totalNilai !== undefined && (
													<span className="text-sm font-semibold text-gray-800">
														Nilai: {student.totalNilai}
													</span>
												)}
											</div>
										</div>
										<button
											onClick={() => handleOpenGrading(student)}
											className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
										>
											👀 Lihat & Nilai
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p className="text-lg">Tidak ada submission untuk ditampilkan</p>
						</div>
					)}
				</div>

				{/* Settings Section */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-6">
						⚙️ Pengaturan Kuis
					</h2>

					<div className="space-y-6">
						{/* Visibility */}
						<div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-bold text-lg">Visibilitas Kuis</h3>
									<p className="text-gray-600 text-sm mt-1">
										Kontrol apakah siswa dapat melihat dan mengerjakan kuis ini
									</p>
								</div>
								<button
									onClick={handleToggleTugasVisibility}
									className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
										kuisVisible
											? "bg-green-600 hover:bg-green-700"
											: "bg-gray-400 hover:bg-gray-500"
									}`}
								>
									{kuisVisible ? "👁️ Terlihat" : "🚫 Tersembunyi"}
								</button>
							</div>
						</div>

						{/* Status Kuis */}
						<div className="bg-green-50 border border-green-300 rounded-lg p-4">
							<h3 className="font-bold text-lg mb-4">Status Kuis</h3>
							<div className="grid grid-cols-3 gap-3">
								{["DRAFT", "PUBLISHED", "CLOSED"].map((status) => (
									<button
										key={status}
										onClick={() => handleUpdateTugasStatus(status)}
										disabled={savingStatus || tugas?.status === status}
										className={`py-3 px-4 rounded-lg font-semibold transition-all ${
											tugas?.status === status
												? status === "PUBLISHED"
													? "bg-green-600 text-white"
													: status === "CLOSED"
													? "bg-red-600 text-white"
													: "bg-yellow-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										} disabled:opacity-50`}
									>
										{status === "DRAFT" && "📝 DRAFT"}
										{status === "PUBLISHED" && "✅ PUBLISHED"}
										{status === "CLOSED" && "🔒 CLOSED"}
									</button>
								))}
							</div>
							<p className="text-sm text-gray-600 mt-3">
								{tugas?.status === "DRAFT" &&
									"Kuis masih dalam tahap pembuatan"}
								{tugas?.status === "PUBLISHED" &&
									"Kuis sudah tersedia untuk siswa"}
								{tugas?.status === "CLOSED" &&
									"Kuis sudah ditutup dan tidak bisa diakses"}
							</p>
						</div>

						{/* Edit Kuis */}
						<div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-bold text-lg">Edit Informasi Kuis</h3>
								{!editingTugas && (
									<button
										onClick={() => setEditingTugas(true)}
										className="text-blue-600 hover:text-blue-800 font-semibold"
									>
										✏️ Edit
									</button>
								)}
							</div>

							{editingTugas ? (
								<div className="space-y-4">
									<div>
										<label className="block font-semibold text-gray-700 mb-2">
											Judul Kuis
										</label>
										<input
											type="text"
											value={tugasEditForm.judulTugas}
											onChange={(e) =>
												setTugasEditForm({
													...tugasEditForm,
													judulTugas: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
										/>
									</div>

									<div>
										<label className="block font-semibold text-gray-700 mb-2">
											Deskripsi
										</label>
										<textarea
											value={tugasEditForm.deskripsi}
											onChange={(e) =>
												setTugasEditForm({
													...tugasEditForm,
													deskripsi: e.target.value,
												})
											}
											rows={4}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
										/>
									</div>

									<div>
										<label className="block font-semibold text-gray-700 mb-2">
											Deadline (Opsional)
										</label>
										<input
											type="datetime-local"
											value={tugasEditForm.deadline}
											onChange={(e) =>
												setTugasEditForm({
													...tugasEditForm,
													deadline: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
										/>
									</div>

									<div className="flex gap-3">
										<button
											onClick={handleSaveTugasEdit}
											disabled={savingTugasEdit}
											className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
										>
											{savingTugasEdit ? "Menyimpan..." : "💾 Simpan"}
										</button>
										<button
											onClick={() => setEditingTugas(false)}
											className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
										>
											Batal
										</button>
									</div>
								</div>
							) : (
								<div className="space-y-2 text-sm">
									<p>
										<strong>Status:</strong>{" "}
										<span className="bg-gray-300 px-2 py-1 rounded">
											{tugas.status}
										</span>
									</p>
									{tugas.deadline && (
										<p>
											<strong>Deadline:</strong>{" "}
											{new Date(tugas.deadline).toLocaleDateString("id-ID")}
										</p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Soal Modal */}
			{showSoalModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
						<div className="p-6">
							<h3 className="text-xl font-bold mb-4">Tambah Soal Essay</h3>

							<div className="space-y-4">
								<div>
									<label className="block font-semibold text-gray-700 mb-2">
										Pertanyaan
									</label>
									<textarea
										value={soalForm.pertanyaan}
										onChange={(e) =>
											setSoalForm({ ...soalForm, pertanyaan: e.target.value })
										}
										placeholder="Masukkan pertanyaan essay..."
										rows={4}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
									/>
								</div>

								<div>
									<label className="block font-semibold text-gray-700 mb-2">
										Bobot (Score untuk soal ini)
									</label>
									<input
										type="number"
										min="1"
										value={soalForm.bobot}
										onChange={(e) =>
											setSoalForm({ ...soalForm, bobot: e.target.value })
										}
										placeholder="Misalnya 25 (untuk 4 soal total 100)"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
									/>
								</div>
							</div>

							<div className="mt-6 flex gap-3 justify-end">
								<button
									onClick={() => setShowSoalModal(false)}
									className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
								>
									Batal
								</button>
								<button
									onClick={handleSaveSoal}
									disabled={savingSoal}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
								>
									{savingSoal ? "Menyimpan..." : "💾 Simpan Soal"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Grading Modal */}
			{showGradingModal && selectedStudent && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-96 overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-bold mb-4">
								Nilai Kuis - {selectedStudent.namaLengkap}
							</h3>

							<div className="space-y-6">
								{selectedStudent.soalJawaban.map((jawaban, index) => (
									<div
										key={jawaban.id}
										className="border border-gray-300 rounded-lg p-4 bg-gray-50"
									>
										<div className="mb-4">
											<p className="font-bold text-lg text-gray-800">
												Soal {index + 1}
											</p>
											<p className="text-gray-700 mt-2">
												{jawaban.soal?.pertanyaan}
											</p>
											<p className="text-sm text-blue-600 mt-1">
												Bobot: {jawaban.soal?.bobot}
											</p>
										</div>

										<div className="bg-white border border-gray-300 rounded-lg p-3 mb-4">
											<p className="font-semibold text-gray-700 mb-2">
												Jawaban Siswa:
											</p>
											<p className="text-gray-700 whitespace-pre-wrap">
												{jawaban.jawaban}
											</p>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block font-semibold text-gray-700 mb-2">
													Nilai (0-{jawaban.soal?.bobot})
												</label>
												<input
													type="number"
													min="0"
													max={jawaban.soal?.bobot || 100}
													value={gradingForm[jawaban.id]?.nilai || ""}
													onChange={(e) =>
														setGradingForm({
															...gradingForm,
															[jawaban.id]: {
																...gradingForm[jawaban.id],
																nilai: e.target.value,
															},
														})
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
												/>
											</div>

											<div>
												<label className="block font-semibold text-gray-700 mb-2">
													Catatan (Opsional)
												</label>
												<input
													type="text"
													value={gradingForm[jawaban.id]?.catatan || ""}
													onChange={(e) =>
														setGradingForm({
															...gradingForm,
															[jawaban.id]: {
																...gradingForm[jawaban.id],
																catatan: e.target.value,
															},
														})
													}
													placeholder="Feedback..."
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
												/>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="mt-6 flex gap-3 justify-end">
								<button
									onClick={() => setShowGradingModal(false)}
									className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
								>
									Batal
								</button>
								<button
									onClick={handleSaveGrades}
									disabled={savingGrade}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
								>
									{savingGrade ? "Menyimpan..." : "💾 Simpan Semua Nilai"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
