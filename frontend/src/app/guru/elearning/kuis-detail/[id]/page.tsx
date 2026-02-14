"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useNotification } from "@/hooks/useNotification";
import kuisDetailService from "@/services/kuis-detail.service";

interface Kuis {
	id: number;
	materiId: number;
	judulTugas: string;
	deskripsi: string;
	tipe: "PILIHAN" | "ESAI";
	deadline?: string;
	status: string;
	createdAt: string;
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
	const tugasId = params.id as string;
	const { user } = useAuthStore();
	const { showSuccess, showError } = useNotification();

	// State
	const [tugas, setTugas] = useState<Kuis | null>(null);
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

	// Load Data
	const loadKuisDetail = useCallback(async () => {
		try {
			setLoading(true);

			// Load tugas
			const tugasResponse = await kuisDetailService.getKuisDetail(
				parseInt(tugasId),
			);
			setTugas(tugasResponse);
			setTugasEditForm({
				judulTugas: tugasResponse.judulTugas,
				deskripsi: tugasResponse.deskripsi,
				deadline: tugasResponse.deadline || "",
			});

			// Load soal esai
			try {
				const soalResponse = await kuisDetailService.getSoalEsaiList(
					parseInt(tugasId),
				);
				setSoalList(Array.isArray(soalResponse) ? soalResponse : []);
			} catch (error) {
				console.log("Error loading soal");
			}

			// Load submissions (endpoint may not exist yet on backend)
			try {
				const submissionsResponse =
					await kuisDetailService.getStudentSubmissions(parseInt(tugasId));
				setStudentSubmissions(
					Array.isArray(submissionsResponse) ? submissionsResponse : [],
				);
			} catch (error) {
				// Silently fail - endpoint may not exist yet
				setStudentSubmissions([]);
			}
		} catch (error: any) {
			// Don't show error toast for auth errors (401/403) - modal will handle it
			if (error.response?.status !== 401 && error.response?.status !== 403) {
				showError("Error loading kuis details");
			}
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

			await kuisDetailService.createSoalEsai(
				parseInt(tugasId),
				tugas?.materiId || 0,
				{
					pertanyaan: soalForm.pertanyaan,
					bobot: bobotNum,
				},
			);

			showSuccess("Soal berhasil dibuat");
			setShowSoalModal(false);
			loadKuisDetail();
		} catch (error: any) {
			showError(error.message || "Error creating soal");
		} finally {
			setSavingSoal(false);
		}
	};

	const handleDeleteSoal = async (soalId: number) => {
		if (!window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;

		try {
			await kuisDetailService.deleteSoalEsai(soalId);
			showSuccess("Soal berhasil dihapus");
			loadKuisDetail();
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
				await fetch(
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
			}

			showSuccess("Semua nilai berhasil disimpan");
			setShowGradingModal(false);
			loadKuisDetail();
		} catch (error: any) {
			showError(error.message || "Error saving grades");
		} finally {
			setSavingGrade(false);
		}
	};

	// ============= SETTINGS HANDLERS =============
	const handleToggleKuisVisibility = async () => {
		try {
			await kuisDetailService.updateKuisVisibility(
				parseInt(tugasId),
				!kuisVisible,
			);
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

			await fetch(
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

			showSuccess("Kuis berhasil diperbarui");
			setEditingTugas(false);
			loadKuisDetail();
		} catch (error: any) {
			showError("Error updating kuis");
		} finally {
			setSavingTugasEdit(false);
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
							href="/guru/elearning"
							className="text-orange-200 hover:text-white transition mb-2 inline-block"
						>
							← Kembali
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
										<button
											onClick={() => handleDeleteSoal(soal.id)}
											className="text-red-600 hover:text-red-800 font-semibold ml-4"
										>
											🗑️
										</button>
									</div>
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
									onClick={handleToggleKuisVisibility}
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
						</div>
					</div>
				</div>
			</div>

			{/* Edit Kuis Modal */}
			{editingTugas && tugas && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
						<div className="sticky top-0 bg-white p-6 border-b border-gray-200">
							<h3 className="text-2xl font-bold">Edit Informasi Kuis</h3>
						</div>
						<div className="p-6 space-y-4">
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
						</div>
						<div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
							<button
								onClick={() => setEditingTugas(false)}
								className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
							>
								Batal
							</button>
							<button
								onClick={handleSaveTugasEdit}
								disabled={savingTugasEdit}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
							>
								{savingTugasEdit ? "Menyimpan..." : "💾 Simpan"}
							</button>
						</div>
					</div>
				</div>
			)}
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
