import axiosInstance from "@/lib/api/axiosInstance";

// ============= INTERFACES =============

export interface Tugas {
	id: number;
	materiId: number;
	judulTugas: string;
	deskripsi: string;
	tipe: "UPLOAD" | "ESAI";
	deadline?: string;
	status: string;
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

export interface UpdateTugasDTO {
	judulTugas?: string;
	deskripsi?: string;
	deadline?: string;
	status?: string;
}

// ============= TUGAS FUNCTIONS =============

/**
 * Fetch tugas detail by ID
 * @param tugasId - Task ID
 * @returns Tugas detail
 */
export const getTugasDetail = async (tugasId: number): Promise<Tugas> => {
	try {
		const response = await axiosInstance.get(`/elearning/tugas/${tugasId}`);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching tugas detail:", error);
		throw error;
	}
};

/**
 * Update tugas detail
 * @param tugasId - Task ID
 * @param data - Updated tugas data
 */
export const updateTugas = async (
	tugasId: number,
	data: UpdateTugasDTO,
): Promise<Tugas> => {
	try {
		const response = await axiosInstance.put(
			`/elearning/tugas/${tugasId}`,
			data,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error updating tugas:", error);
		throw error;
	}
};

/**
 * Delete tugas
 * @param tugasId - Task ID
 */
export const deleteTugas = async (tugasId: number): Promise<void> => {
	try {
		await axiosInstance.delete(`/elearning/tugas/${tugasId}`);
	} catch (error) {
		console.error("Error deleting tugas:", error);
		throw error;
	}
};

/**
 * Publish tugas
 * @param tugasId - Task ID
 */
export const publishTugas = async (tugasId: number): Promise<Tugas> => {
	try {
		const response = await axiosInstance.post(
			`/elearning/tugas/${tugasId}/publish`,
			{},
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error publishing tugas:", error);
		throw error;
	}
};

/**
 * Close tugas
 * @param tugasId - Task ID
 */
export const closeTugas = async (tugasId: number): Promise<Tugas> => {
	try {
		const response = await axiosInstance.post(
			`/elearning/tugas/${tugasId}/close`,
			{},
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error closing tugas:", error);
		throw error;
	}
};

// ============= SOAL FUNCTIONS =============

/**
 * Get all soal esai for a tugas
 * @param tugasId - Task ID
 * @returns Array of soal esai
 */
export const getSoalEsaiList = async (tugasId: number): Promise<SoalEsai[]> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/soal-esai/tugas/${tugasId}`,
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
 * @param tugasId - Task ID
 * @param soalId - Question ID
 * @returns Soal detail
 */
export const getSoalEsaiDetail = async (
	tugasId: number,
	soalId: number,
): Promise<SoalEsai> => {
	try {
		const response = await axiosInstance.get(`/elearning/soal-esai/${soalId}`);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching soal esai detail:", error);
		throw error;
	}
};

/**
 * Create soal esai
 * @param tugasId - Task ID
 * @param materiId - Material ID
 * @param data - Soal data
 */
export const createSoalEsai = async (
	tugasId: number,
	materiId: number,
	data: CreateSoalEsaiDTO,
): Promise<SoalEsai> => {
	try {
		const payload = {
			materiId,
			tugasId,
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
 * Get all student submissions for a tugas
 * @param tugasId - Task ID
 * @returns Array of student submissions
 */
export const getStudentSubmissions = async (
	tugasId: number,
): Promise<StudentSubmission[]> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/jawaban-esai/tugas/${tugasId}`,
		);
		const data = response.data.data || response.data;
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error("Error fetching student submissions:", error);
		return [];
	}
};

/**
 * Get submissions for kuis (quiz)
 * @param kuisId - Quiz ID
 * @returns Array of student submissions
 */
export const getKuisSubmissions = async (
	kuisId: number,
): Promise<StudentSubmission[]> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/kuis/${kuisId}/submissions`,
		);
		const data = response.data.data || response.data;
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error("Error fetching kuis submissions:", error);
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
 * Grade all jawaban for a student in a tugas
 * @param tugasId - Task ID
 * @param pesertaDidikId - Student ID
 * @param grades - Array of grade data
 */
export const gradeStudentTugas = async (
	tugasId: number,
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
		console.error("Error grading student tugas:", error);
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
 * Update tugas visibility (show/hide to students)
 * @param tugasId - Task ID
 * @param visible - Visibility status
 */
export const updateTugasVisibility = async (
	tugasId: number,
	visible: boolean,
): Promise<Tugas> => {
	try {
		const response = await axiosInstance.put(`/elearning/tugas/${tugasId}`, {
			visible,
		});
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error updating tugas visibility:", error);
		throw error;
	}
};

/**
 * Update kuis visibility
 * @param kuisId - Quiz ID
 * @param visible - Visibility status
 */
export const updateKuisVisibility = async (
	kuisId: number,
	visible: boolean,
): Promise<Tugas> => {
	try {
		const response = await axiosInstance.put(`/elearning/tugas/${kuisId}`, {
			visible,
		});
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error updating kuis visibility:", error);
		throw error;
	}
};

/**
 * Allow student to resubmit
 * @param tugasId - Task ID
 * @param pesertaDidikId - Student ID
 */
export const allowResubmit = async (
	tugasId: number,
	pesertaDidikId: number,
): Promise<void> => {
	try {
		await axiosInstance.post(
			`/elearning/tugas/${tugasId}/student/${pesertaDidikId}/allow-resubmit`,
			{},
		);
	} catch (error) {
		console.error("Error allowing resubmit:", error);
		throw error;
	}
};

/**
 * Extend deadline for a student
 * @param tugasId - Task ID
 * @param pesertaDidikId - Student ID
 * @param newDeadline - New deadline date
 */
export const extendDeadline = async (
	tugasId: number,
	pesertaDidikId: number,
	newDeadline: string,
): Promise<void> => {
	try {
		await axiosInstance.post(
			`/elearning/tugas/${tugasId}/student/${pesertaDidikId}/extend-deadline`,
			{ newDeadline },
		);
	} catch (error) {
		console.error("Error extending deadline:", error);
		throw error;
	}
};

// ============= STATISTICS & REPORTING FUNCTIONS =============

/**
 * Get tugas statistics
 * @param tugasId - Task ID
 */
export const getTugasStatistics = async (
	tugasId: number,
): Promise<{
	totalStudents: number;
	submitted: number;
	graded: number;
	pending: number;
	averageScore: number;
}> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/tugas/${tugasId}/statistics`,
		);
		return response.data.data || response.data;
	} catch (error) {
		console.error("Error fetching tugas statistics:", error);
		throw error;
	}
};

/**
 * Export grades to CSV
 * @param tugasId - Task ID
 */
export const exportGradeToCSV = async (tugasId: number): Promise<Blob> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/tugas/${tugasId}/export-grades`,
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
 * @param tugasId - Task ID
 */
export const exportSubmissionsToPDF = async (
	tugasId: number,
): Promise<Blob> => {
	try {
		const response = await axiosInstance.get(
			`/elearning/tugas/${tugasId}/export-submissions`,
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

export default {
	// Tugas
	getTugasDetail,
	updateTugas,
	deleteTugas,
	publishTugas,
	closeTugas,
	updateTugasVisibility,

	// Soal
	getSoalEsaiList,
	getSoalEsaiDetail,
	createSoalEsai,
	updateSoalEsai,
	deleteSoalEsai,

	// Submissions
	getStudentSubmissions,
	getKuisSubmissions,
	getJawabanEsaiDetail,

	// Grading
	gradeJawabanEsai,
	gradeStudentTugas,
	reopenJawabanEsai,

	// Settings
	updateKuisVisibility,
	allowResubmit,
	extendDeadline,

	// Statistics & Reporting
	getTugasStatistics,
	exportGradeToCSV,
	exportSubmissionsToPDF,
};
