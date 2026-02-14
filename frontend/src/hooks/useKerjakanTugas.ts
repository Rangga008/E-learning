/**
 * Custom Hook for Student Task Operations (Kerjakan)
 * Manages the entire workflow for students working on tasks/quizzes
 */

import { useEffect, useState, useCallback } from "react";
import {
	siswaTugasService,
	TaskDetail,
	EssayQuestion,
	StudentAnswer,
	KuisDetail,
} from "@/services/siswa-tugas.service";
import { APIError } from "@/lib/api/types";
import { useNotification } from "@/hooks/useNotification";

interface UseKerjakanTugasState {
	taskDetail: TaskDetail | null;
	essayQuestions: EssayQuestion[];
	studentAnswers: Map<number, StudentAnswer>;
	loading: boolean;
	error: string | null;
	isLate: boolean;
	isAvailable: boolean;
	timeRemaining: {
		expired: boolean;
		days: number;
		hours: number;
		minutes: number;
	} | null;
}

interface UseKerjakanTugasActions {
	submitAnswer: (
		questionId: number,
		answer: string,
	) => Promise<StudentAnswer | null>;
	submitAllAnswers: (answers: { [key: number]: string }) => Promise<boolean>;
	submitFile: (file: File) => Promise<boolean>;
	refreshTask: () => Promise<void>;
	getAnswer: (questionId: number) => StudentAnswer | undefined;
	formatDate: (dateStr: string) => string;
}

export function useKerjakanTugas(
	taskId: number,
): UseKerjakanTugasState & UseKerjakanTugasActions {
	const { showSuccess, showError } = useNotification();

	// State
	const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
	const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);
	const [studentAnswers, setStudentAnswers] = useState<
		Map<number, StudentAnswer>
	>(new Map());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isLate, setIsLate] = useState(false);
	const [isAvailable, setIsAvailable] = useState(true);
	const [timeRemaining, setTimeRemaining] = useState<{
		expired: boolean;
		days: number;
		hours: number;
		minutes: number;
	} | null>(null);

	// Initialize task work session
	const initializeTask = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch task detail using the unified endpoint
			const kuisDetail = await siswaTugasService.kerjakanTugas(taskId);

			setTaskDetail(kuisDetail);
			setEssayQuestions(kuisDetail.soalList || []);

			// Check deadline status
			setIsLate(siswaTugasService.isTaskLate(kuisDetail.tanggalDeadline));
			setIsAvailable(siswaTugasService.isTaskAvailable(kuisDetail.tanggalBuka));

			// Calculate remaining time
			const remaining = siswaTugasService.getRemainingTime(
				kuisDetail.tanggalDeadline,
			);
			setTimeRemaining(remaining);

			// Fetch student answers if there are questions
			if (kuisDetail.soalList && kuisDetail.soalList.length > 0) {
				const answers = await siswaTugasService.getStudentAnswers(
					kuisDetail.soalList,
				);
				setStudentAnswers(answers);
			}
		} catch (err) {
			const message =
				err instanceof APIError ? err.message : "Gagal memuat tugas";
			setError(message);
			showError(message);
		} finally {
			setLoading(false);
		}
	}, [taskId, showError]);

	useEffect(() => {
		if (taskId) {
			initializeTask();
		}
	}, [taskId, initializeTask]);

	// Actions
	const submitAnswer = useCallback(
		async (
			questionId: number,
			answer: string,
		): Promise<StudentAnswer | null> => {
			try {
				const result = await siswaTugasService.submitEssayAnswer(
					questionId,
					answer,
				);
				setStudentAnswers((prev) => {
					const newMap = new Map(prev);
					newMap.set(questionId, result);
					return newMap;
				});
				showSuccess("Jawaban disimpan");
				return result;
			} catch (err) {
				const message =
					err instanceof APIError ? err.message : "Gagal menyimpan jawaban";
				showError(message);
				return null;
			}
		},
		[showSuccess, showError],
	);

	const submitAllAnswers = useCallback(
		async (answers: { [key: number]: string }): Promise<boolean> => {
			try {
				const result = await siswaTugasService.submitAllEssayAnswers(
					essayQuestions,
					answers,
				);

				// Update answers map
				result.results.forEach((answer) => {
					setStudentAnswers((prev) => {
						const newMap = new Map(prev);
						newMap.set(answer.soalEsaiId, answer);
						return newMap;
					});
				});

				if (result.success) {
					showSuccess("Semua jawaban berhasil disubmit");
				} else {
					showSuccess(
						`${result.results.length} dari ${essayQuestions.length} jawaban berhasil disubmit`,
					);
				}

				return result.success;
			} catch (err) {
				const message =
					err instanceof APIError ? err.message : "Gagal mensubmit jawaban";
				showError(message);
				return false;
			}
		},
		[essayQuestions, showSuccess, showError],
	);

	const submitFile = useCallback(
		async (file: File): Promise<boolean> => {
			try {
				// Validate file
				const validation = siswaTugasService.validateSubmissionFile(
					file,
					taskDetail?.tipeSubmisi || [
						"image/jpeg",
						"image/png",
						"application/pdf",
					],
					10,
				);

				if (!validation.valid) {
					showError(validation.error || "File tidak valid");
					return false;
				}

				// Submit file
				const result = await siswaTugasService.submitFileAnswer(taskId, file);

				showSuccess(result.message);
				return true;
			} catch (err) {
				const message =
					err instanceof APIError ? err.message : "Gagal mengupload file";
				showError(message);
				return false;
			}
		},
		[taskId, taskDetail, showSuccess, showError],
	);

	const refreshTask = useCallback(async () => {
		await initializeTask();
	}, [initializeTask]);

	const getAnswer = useCallback(
		(questionId: number): StudentAnswer | undefined => {
			return studentAnswers.get(questionId);
		},
		[studentAnswers],
	);

	const formatDate = useCallback((dateStr: string): string => {
		return siswaTugasService.formatTaskDate(dateStr);
	}, []);

	return {
		// State
		taskDetail,
		essayQuestions,
		studentAnswers,
		loading,
		error,
		isLate,
		isAvailable,
		timeRemaining,
		// Actions
		submitAnswer,
		submitAllAnswers,
		submitFile,
		refreshTask,
		getAnswer,
		formatDate,
	};
}
