/**
 * Siswa Tugas Service
 * Handles all task/assignment operations for students
 */

import { apiClient } from "@/utils/apiClient";
import { APIError } from "@/lib/api/types";

export interface TaskDetail {
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
	filePath?: string;
	fileName?: string;
	fileType?: string;
}

export interface EssayQuestion {
	id: number;
	pertanyaan: string;
	bobot: number;
}

export interface StudentAnswer {
	id: number;
	soalEsaiId: number;
	jawaban: string;
	nilai?: number;
	catatanGuru?: string;
	sudahDinilai: boolean;
}

export interface TaskSubmission {
	id: number;
	filePath: string;
	tipeFile: string;
	createdAt: string;
	nilai: number | null;
	feedback?: string;
	isLate: boolean;
}

export interface KuisDetail extends TaskDetail {
	totalBobot: number;
	soalList: EssayQuestion[];
}

class SiswaTugasService {
	/**
	 * Fetch task/quiz detail - both use same endpoint since backend uses 'tipe' field to distinguish
	 */
	async getTaskDetailById(taskId: number): Promise<TaskDetail> {
		try {
			const response = await apiClient.get(`/elearning/tugas/${taskId}`);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 404) {
				throw new APIError(
					"Tugas/Kuis tidak ditemukan",
					error.response.status,
					"TASK_NOT_FOUND",
				);
			}
			if (error.response?.status === 401) {
				throw new APIError(
					"Anda tidak memiliki akses ke tugas/kuis ini",
					error.response.status,
					"FETCH_ERROR",
				);
			}
			throw new APIError(
				"Gagal memuat detail tugas/kuis",
				error.response?.status || 500,
				"FETCH_ERROR",
			);
		}
	}

	/**
	 * Fetch task/quiz detail
	 * Works for both regular tasks and essay quizzes
	 */
	async getTaskDetail(taskId: number): Promise<TaskDetail> {
		try {
			const response = await apiClient.get(`/elearning/tugas/${taskId}`);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 404) {
				throw new APIError(
					"Tugas tidak ditemukan",
					error.response.status,
					"TASK_NOT_FOUND",
				);
			}
			if (error.response?.status === 401) {
				throw new APIError(
					"Anda tidak memiliki akses ke tugas ini",
					error.response.status,
					"FETCH_ERROR",
				);
			}
			throw new APIError(
				"Gagal memuat detail tugas",
				error.response?.status || 500,
				"FETCH_ERROR",
			);
		}
	}

	/**
	 * Fetch essay questions for a specific task
	 */
	async getTaskEssayQuestions(taskId: number): Promise<EssayQuestion[]> {
		try {
			const response = await apiClient.get(
				`/elearning/soal-esai/tugas/${taskId}`,
			);
			// Handle both direct array and wrapped response
			if (Array.isArray(response.data)) {
				return response.data;
			}
			return response.data.data || [];
		} catch (error: any) {
			if (error.response?.status === 401) {
				throw new APIError(
					"Anda tidak memiliki akses ke soal ini",
					error.response.status,
					"FETCH_ERROR",
				);
			}
			// Return empty array if no questions found
			return [];
		}
	}

	/**
	 * Fetch student's existing essay answers for a task
	 */
	async getStudentAnswers(
		questions: EssayQuestion[],
	): Promise<Map<number, StudentAnswer>> {
		const answersMap = new Map<number, StudentAnswer>();

		try {
			for (const question of questions) {
				try {
					const response = await apiClient.get(
						`/elearning/jawaban-esai/soal/${question.id}`,
					);
					// Extract answer from response: handle wrapped {success: true, data: null}
					let answer = null;
					if (response.data) {
						// If response.data has a 'data' property, use that (wrapped response)
						if ("data" in response.data) {
							answer = response.data.data;
						}
						// Otherwise check if response.data is an array (direct array)
						else if (Array.isArray(response.data)) {
							answer = response.data[0] || null;
						}
						// Otherwise use response.data as is
						else {
							answer = response.data;
						}
					}

					console.log(`[GETANSWERS] Question ${question.id}: answer =`, answer);

					if (answer) {
						answersMap.set(question.id, answer);
					}
				} catch (error) {
					// Continue fetching other answers - 404 is expected if no answer yet
					console.warn(`Failed to fetch answer for question ${question.id}`);
				}
			}
		} catch (error) {
			console.error("Error fetching answers:", error);
		}

		return answersMap;
	}

	/**
	 * Submit or update essay answer
	 */
	async submitEssayAnswer(
		questionId: number,
		answer: string,
	): Promise<StudentAnswer> {
		try {
			const response = await apiClient.post(`/elearning/jawaban-esai`, {
				soalEsaiId: questionId,
				jawaban: answer,
			});
			// Backend returns {success, message, data}
			return response.data.data || response.data;
		} catch (error: any) {
			if (error.response?.status === 401) {
				throw new APIError(
					"Sesi Anda telah berakhir. Silakan login kembali",
					error.response.status,
					"SUBMIT_ERROR",
				);
			}
			throw new APIError(
				"Gagal menyimpan jawaban",
				error.response?.status || 500,
				"SUBMIT_ERROR",
			);
		}
	}

	/**
	 * Submit all essay answers at once
	 */
	async submitAllEssayAnswers(
		questions: EssayQuestion[],
		answers: { [key: number]: string },
	): Promise<{ success: boolean; results: StudentAnswer[] }> {
		const results: StudentAnswer[] = [];

		try {
			for (const question of questions) {
				const answer = answers[question.id];
				if (answer && answer.trim()) {
					try {
						const result = await this.submitEssayAnswer(question.id, answer);
						results.push(result);
					} catch (error) {
						console.error(
							`Failed to submit answer for question ${question.id}:`,
							error,
						);
						// Continue with next answer
					}
				}
			}

			return {
				success: results.length === questions.length,
				results,
			};
		} catch (error) {
			throw new APIError("Gagal mensubmit jawaban", 500, "SUBMIT_ERROR");
		}
	}

	/**
	 * Upload file submission for a task
	 */
	async submitFileAnswer(
		taskId: number,
		file: File,
	): Promise<{ success: boolean; message: string }> {
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("tugasId", String(taskId));
			formData.append("tipeFile", file.type);

			const response = await apiClient.post(
				`/elearning/jawaban-tugas/submit`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);

			return {
				success: true,
				message: "File berhasil diupload",
			};
		} catch (error: any) {
			if (error.response?.status === 401) {
				throw new APIError(
					"Sesi Anda telah berakhir. Silakan login kembali",
					error.response.status,
					"UPLOAD_ERROR",
				);
			}
			const errorMsg = error.response?.data?.message || "Gagal mengupload file";
			throw new APIError(
				errorMsg,
				error.response?.status || 500,
				"UPLOAD_ERROR",
			);
		}
	}

	/**
	 * Get student's file submissions for a task
	 */
	async getTaskSubmissions(taskId: number): Promise<TaskSubmission | null> {
		try {
			const response = await apiClient.get(
				`/elearning/tugas/${taskId}/jawaban-siswa`,
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching submissions:", error);
			return null;
		}
	}

	/**
	 * Check if task deadline has passed
	 */
	isTaskLate(deadlineStr: string): boolean {
		return new Date() > new Date(deadlineStr);
	}

	/**
	 * Check if task is available (open date has passed)
	 */
	isTaskAvailable(openDateStr: string): boolean {
		return new Date() > new Date(openDateStr);
	}

	/**
	 * Format task dates for display
	 */
	formatTaskDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString("id-ID", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	/**
	 * Get remaining time until deadline
	 */
	getRemainingTime(deadlineStr: string): {
		expired: boolean;
		days: number;
		hours: number;
		minutes: number;
	} {
		const deadline = new Date(deadlineStr);
		const now = new Date();
		const diff = deadline.getTime() - now.getTime();

		if (diff <= 0) {
			return { expired: true, days: 0, hours: 0, minutes: 0 };
		}

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
		const minutes = Math.floor((diff / 1000 / 60) % 60);

		return { expired: false, days, hours, minutes };
	}

	/**
	 * Main "kerjakan" function - Initialize task work session
	 * This is the entry point for students starting a task
	 */
	async kerjakanTugas(taskId: number): Promise<KuisDetail> {
		try {
			// Fetch task details
			const taskDetail = await this.getTaskDetail(taskId);

			// Check if this is an essay quiz (has soal-esai)
			const essayQuestions = await this.getTaskEssayQuestions(taskId);

			// Calculate total bobot for essay questions
			const totalBobot = essayQuestions.reduce((sum, q) => sum + q.bobot, 0);

			return {
				...taskDetail,
				totalBobot,
				soalList: essayQuestions,
			} as KuisDetail;
		} catch (error) {
			if (error instanceof APIError) throw error;
			throw new APIError("Gagal memulai tugas", 500, "INIT_ERROR");
		}
	}

	/**
	 * Validate file for submission
	 */
	validateSubmissionFile(
		file: File,
		allowedTypes: string[],
		maxSizeMB: number = 10,
	): { valid: boolean; error?: string } {
		// Check file size
		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			return {
				valid: false,
				error: `Ukuran file tidak boleh lebih dari ${maxSizeMB}MB`,
			};
		}

		// Check file type
		if (allowedTypes && allowedTypes.length > 0) {
			if (!allowedTypes.includes(file.type)) {
				return {
					valid: false,
					error: `Format file tidak diizinkan. Format yang diterima: ${allowedTypes.join(
						", ",
					)}`,
				};
			}
		}

		return { valid: true };
	}
}

export const siswaTugasService = new SiswaTugasService();
