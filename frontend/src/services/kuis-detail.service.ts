import axiosInstance from "@/lib/api/axiosInstance";

// ============= INTERFACES =============

export interface Kuis {
	id: number;
	materiId: number;
	judulTugas: string;
	deskripsi: string;
	tipe: "PILIHAN" | "ESAI";
	deadline?: string;
	status: string;
	durasi?: number; // minutes
	totalBobot?: number;
	createdAt: string;
}

export interface SoalEsai {
	id: number;
	tugasId: number;
	pertanyaan: string;
	bobot: number;
	createdAt: string;
}

export interface JawabanEsai {
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

export interface StudentSubmission {
	pesertaDidikId: number;
	namaLengkap: string;
	nisn: string;
	soalJawaban: JawabanEsai[];
	totalNilai?: number;
	sudahDinilaiSemua: boolean;
	waktuSubmit?: string;
	durasi?: number; // seconds taken
}

export interface CreateSoalEsaiDTO {
	materiId?: number;
	pertanyaan: string;
	bobot: number;
}

export interface GradeDTO {
	nilai: number;
	catatanGuru?: string;
}

export interface UpdateKuisDTO {
	judulTugas?: string;
	deskripsi?: string;
	deadline?: string;
	status?: string;
	durasi?: number;
}

// ============= KUIS FUNCTIONS =============

/**
 * Fetch kuis detail by ID
 * @param kuisId - Quiz ID
 * @returns Kuis detail
 */
export const getKuisDetail = async (kuisId: number): Promise<Kuis> => {
	try {
		const response = await axiosInstance.get(`/elearning/kuis/${kuisId}`);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching kuis detail:", error);
		throw error;
	}
};

/**
 * Update kuis detail
 * @param kuisId - Quiz ID
 * @param data - Updated kuis data
 */
export const updateKuis = async (
	kuisId: number,
	data: UpdateKuisDTO,
): Promise<Kuis> => {
	try {
		const response = await axiosInstance.put(`/elearning/kuis/${kuisId}`, data);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error updating kuis:", error);
		throw error;
	}
};

/**
 * Delete kuis
 * @param kuisId - Quiz ID
 */
export const deleteKuis = async (kuisId: number): Promise<void> => {
	try {
		await axiosInstance.delete(`/elearning/kuis/${kuisId}`);
	} catch (error) {
		console.error("Error deleting kuis:", error);
		throw error;
	}
};

/**
 * Publish kuis
 * @param kuisId - Quiz ID
 */
export const publishKuis = async (kuisId: number): Promise<Kuis> => {
	try {
		const response = await axiosInstance.post(
			`/elearning/kuis/${kuisId}/publish`,
			{},
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error publishing kuis:", error);
		throw error;
	}
};

/**
 * Close kuis
 * @param kuisId - Quiz ID
 */
export const closeKuis = async (kuisId: number): Promise<Kuis> => {
	try {
		const response = await axiosInstance.post(
			`/elearning/kuis/${kuisId}/close`,
			{},
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error closing kuis:", error);
		throw error;
	}
};

// ============= SOAL FUNCTIONS =============

/**
 * Get all soal esai for a kuis
 * @param kuisId - Quiz ID
 * @returns Array of soal esai
 */
export const getSoalEsaiList = async (kuisId: number): Promise<SoalEsai[]> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/soal-esai/kuis/${kuisId}`,
		);
		const data = response.data.data || response.data;
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error("Error fetching soal esai list:", error);
		return [];
	}
};

/**
 * Get single soal esai detail
 * @param soalId - Question ID
 */
export const getSoalEsaiDetail = async (soalId: number): Promise<SoalEsai> => {
	try {
		const response = await axiosInstance.get(`/elearning/soal-esai/${soalId}`);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching soal esai detail:", error);
		throw error;
	}
};

/**
 * Create soal esai for kuis
 * @param kuisId - Quiz ID
 * @param materiId - Material ID
 * @param data - Soal data
 */
export const createSoalEsai = async (
	kuisId: number,
	materiId: number,
	data: CreateSoalEsaiDTO,
): Promise<SoalEsai> => {
	try {
		const payload = {
			materiId,
			tugasId: kuisId,
			...data,
		};
		const response = await axiosInstance.post(`/elearning/soal-esai`, payload);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error creating soal esai:", error);
		throw error;
	}
};

/**
 * Update soal esai
 * @param soalId - Question ID
 * @param data - Updated soal data
 */
export const updateSoalEsai = async (
	soalId: number,
	data: CreateSoalEsaiDTO,
): Promise<SoalEsai> => {
	try {
		const response = await axiosInstance.put(
			`/elearning/soal-esai/${soalId}`,
			data,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error updating soal esai:", error);
		throw error;
	}
};

/**
 * Delete soal esai
 * @param soalId - Question ID
 */
export const deleteSoalEsai = async (soalId: number): Promise<void> => {
	try {
		await axiosInstance.delete(`/elearning/soal-esai/${soalId}`);
	} catch (error) {
		console.error("Error deleting soal esai:", error);
		throw error;
	}
};

// ============= SUBMISSION FUNCTIONS =============

/**
 * Get all student submissions for a kuis
 * @param kuisId - Quiz ID
 * @returns Array of student submissions
 */
export const getStudentSubmissions = async (
	kuisId: number,
): Promise<StudentSubmission[]> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/jawaban-esai/tugas/${kuisId}`,
		);
		const data = response.data.data || response.data;
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error("Error fetching student submissions:", error);
		return [];
	}
};

/**
 * Get single jawaban esai detail
 * @param jawabanId - Answer ID
 */
export const getJawabanEsaiDetail = async (
	jawabanId: number,
): Promise<JawabanEsai> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/jawaban-esai/${jawabanId}`,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching jawaban esai detail:", error);
		throw error;
	}
};

/**
 * Get student's submission detail for a kuis
 * @param kuisId - Quiz ID
 * @param pesertaDidikId - Student ID
 */
export const getStudentKuisSubmission = async (
	kuisId: number,
	pesertaDidikId: number,
): Promise<StudentSubmission> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/kuis/${kuisId}/student/${pesertaDidikId}/submission`,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching student kuis submission:", error);
		throw error;
	}
};

// ============= GRADING FUNCTIONS =============

/**
 * Grade a single jawaban esai
 * @param jawabanId - Answer ID
 * @param grade - Grade data (nilai, catatanGuru)
 */
export const gradeJawabanEsai = async (
	jawabanId: number,
	grade: GradeDTO,
): Promise<JawabanEsai> => {
	try {
		const response = await axiosInstance.post(
			`/elearning/jawaban-esai/${jawabanId}/grade`,
			grade,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error grading jawaban esai:", error);
		throw error;
	}
};

/**
 * Grade all jawaban for a student in a kuis
 * @param kuisId - Quiz ID
 * @param pesertaDidikId - Student ID
 * @param grades - Array of grade data
 */
export const gradeStudentKuis = async (
	kuisId: number,
	pesertaDidikId: number,
	grades: Array<{ jawabanId: number; nilai: number; catatanGuru?: string }>,
): Promise<void> => {
	try {
		// Grade each jawaban in parallel
		const gradePromises = grades.map((grade) =>
			gradeJawabanEsai(grade.jawabanId, {
				nilai: grade.nilai,
				catatanGuru: grade.catatanGuru,
			}),
		);
		await Promise.all(gradePromises);
	} catch (error) {
		console.error("Error grading student kuis:", error);
		throw error;
	}
};

/**
 * Reopen a jawaban for re-grading
 * @param jawabanId - Answer ID
 */
export const reopenJawabanEsai = async (
	jawabanId: number,
): Promise<JawabanEsai> => {
	try {
		const response = await axiosInstance.post(
			`/elearning/jawaban-esai/${jawabanId}/reopen`,
			{},
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error reopening jawaban esai:", error);
		throw error;
	}
};

// ============= VISIBILITY & SETTINGS FUNCTIONS =============

/**
 * Update kuis visibility (show/hide to students)
 * @param kuisId - Quiz ID
 * @param visible - Visibility status
 */
export const updateKuisVisibility = async (
	kuisId: number,
	visible: boolean,
): Promise<Kuis> => {
	try {
		const response = await axiosInstance.put(`/elearning/kuis/${kuisId}`, {
			visible,
		});
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error updating kuis visibility:", error);
		throw error;
	}
};

/**
 * Allow student to retake kuis
 * @param kuisId - Quiz ID
 * @param pesertaDidikId - Student ID
 */
export const allowRetake = async (
	kuisId: number,
	pesertaDidikId: number,
): Promise<void> => {
	try {
		await axiosInstance.post(
			`/elearning/kuis/${kuisId}/student/${pesertaDidikId}/allow-retake`,
			{},
		);
	} catch (error) {
		console.error("Error allowing retake:", error);
		throw error;
	}
};

/**
 * Extend deadline for a student
 * @param kuisId - Quiz ID
 * @param pesertaDidikId - Student ID
 * @param newDeadline - New deadline date
 */
export const extendDeadline = async (
	kuisId: number,
	pesertaDidikId: number,
	newDeadline: string,
): Promise<void> => {
	try {
		await axiosInstance.post(
			`/elearning/kuis/${kuisId}/student/${pesertaDidikId}/extend-deadline`,
			{ newDeadline },
		);
	} catch (error) {
		console.error("Error extending deadline:", error);
		throw error;
	}
};

// ============= STATISTICS & REPORTING FUNCTIONS =============

/**
 * Get kuis statistics
 * @param kuisId - Quiz ID
 */
export const getKuisStatistics = async (
	kuisId: number,
): Promise<{
	totalStudents: number;
	submitted: number;
	graded: number;
	pending: number;
	averageScore: number;
	highestScore: number;
	lowestScore: number;
}> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/kuis/${kuisId}/statistics`,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching kuis statistics:", error);
		throw error;
	}
};

/**
 * Get student's kuis result/score
 * @param kuisId - Quiz ID
 * @param pesertaDidikId - Student ID
 */
export const getStudentKuisScore = async (
	kuisId: number,
	pesertaDidikId: number,
): Promise<{
	totalNilai: number;
	maxNilai: number;
	percentage: number;
	status: string;
}> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/kuis/${kuisId}/student/${pesertaDidikId}/score`,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching student kuis score:", error);
		throw error;
	}
};

/**
 * Export grades to CSV
 * @param kuisId - Quiz ID
 */
export const exportGradeToCSV = async (kuisId: number): Promise<Blob> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/kuis/${kuisId}/export-grades`,
			{
				responseType: "blob",
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error exporting grades:", error);
		throw error;
	}
};

/**
 * Export student submissions to PDF
 * @param kuisId - Quiz ID
 */
export const exportSubmissionsToPDF = async (kuisId: number): Promise<Blob> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/kuis/${kuisId}/export-submissions`,
			{
				responseType: "blob",
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error exporting submissions:", error);
		throw error;
	}
};

/**
 * Generate kuis report with analytics
 * @param kuisId - Quiz ID
 */
export const generateKuisReport = async (
	kuisId: number,
): Promise<{
	kuisInfo: Kuis;
	statistics: any;
	submissions: StudentSubmission[];
	analysis: any;
}> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/kuis/${kuisId}/report`,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error generating kuis report:", error);
		throw error;
	}
};

export default {
	// Kuis
	getKuisDetail,
	updateKuis,
	deleteKuis,
	publishKuis,
	closeKuis,
	updateKuisVisibility,

	// Soal
	getSoalEsaiList,
	getSoalEsaiDetail,
	createSoalEsai,
	updateSoalEsai,
	deleteSoalEsai,

	// Submissions
	getStudentSubmissions,
	getJawabanEsaiDetail,
	getStudentKuisSubmission,

	// Grading
	gradeJawabanEsai,
	gradeStudentKuis,
	reopenJawabanEsai,

	// Settings
	allowRetake,
	extendDeadline,

	// Statistics & Reporting
	getKuisStatistics,
	getStudentKuisScore,
	exportGradeToCSV,
	exportSubmissionsToPDF,
	generateKuisReport,
};
