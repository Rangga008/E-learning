import { useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import tugasDetailService from "@/services/tugas-detail.service";
import kuisDetailService from "@/services/kuis-detail.service";

/**
 * Hook untuk manage tugas detail operations
 */
export const useTugasDetail = (tugasId: number, materiId: number) => {
	const { showSuccess, showError } = useNotification();
	const [loading, setLoading] = useState(false);

	// SOAL OPERATIONS
	const addSoal = useCallback(
		async (pertanyaan: string, bobot: number) => {
			try {
				setLoading(true);
				const result = await tugasDetailService.createSoalEsai(
					tugasId,
					materiId,
					{
						pertanyaan,
						bobot,
					},
				);
				showSuccess("Soal berhasil ditambahkan");
				return result;
			} catch (error: any) {
				// Don't show error for auth errors - modal will handle it
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal menambahkan soal");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[tugasId, materiId, showSuccess, showError],
	);

	const deleteSoal = useCallback(
		async (soalId: number) => {
			try {
				setLoading(true);
				await tugasDetailService.deleteSoalEsai(soalId);
				showSuccess("Soal berhasil dihapus");
			} catch (error: any) {
				showError(error.message || "Gagal menghapus soal");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[showSuccess, showError],
	);

	const updateSoal = useCallback(
		async (soalId: number, pertanyaan: string, bobot: number) => {
			try {
				setLoading(true);
				const result = await tugasDetailService.updateSoalEsai(soalId, {
					pertanyaan,
					bobot,
				});
				showSuccess("Soal berhasil diperbarui");
				return result;
			} catch (error: any) {
				showError(error.message || "Gagal memperbarui soal");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[showSuccess, showError],
	);

	// GRADING OPERATIONS
	const gradeStudent = useCallback(
		async (
			pesertaDidikId: number,
			grades: Array<{ jawabanId: number; nilai: number; catatanGuru?: string }>,
		) => {
			try {
				setLoading(true);
				await tugasDetailService.gradeStudentTugas(
					tugasId,
					pesertaDidikId,
					grades,
				);
				showSuccess("Nilai berhasil disimpan");
			} catch (error: any) {
				showError(error.message || "Gagal menyimpan nilai");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[tugasId, showSuccess, showError],
	);

	const reopenJawaban = useCallback(
		async (jawabanId: number) => {
			try {
				setLoading(true);
				await tugasDetailService.reopenJawabanEsai(jawabanId);
				showSuccess("Jawaban berhasil dibuka kembali");
			} catch (error: any) {
				showError(error.message || "Gagal membuka jawaban");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[showSuccess, showError],
	);

	// TUGAS OPERATIONS
	const publishTugas = useCallback(async () => {
		try {
			setLoading(true);
			await tugasDetailService.publishTugas(tugasId);
			showSuccess("Tugas berhasil dipublikasikan");
		} catch (error: any) {
			showError(error.message || "Gagal mempublikasikan tugas");
			throw error;
		} finally {
			setLoading(false);
		}
	}, [tugasId, showSuccess, showError]);

	const closeTugas = useCallback(async () => {
		try {
			setLoading(true);
			await tugasDetailService.closeTugas(tugasId);
			showSuccess("Tugas berhasil ditutup");
		} catch (error: any) {
			showError(error.message || "Gagal menutup tugas");
			throw error;
		} finally {
			setLoading(false);
		}
	}, [tugasId, showSuccess, showError]);

	const allowResubmit = useCallback(
		async (pesertaDidikId: number) => {
			try {
				setLoading(true);
				await tugasDetailService.allowResubmit(tugasId, pesertaDidikId);
				showSuccess("Pengiriman ulang diizinkan");
			} catch (error: any) {
				showError(error.message || "Gagal mengizinkan pengiriman ulang");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[tugasId, showSuccess, showError],
	);

	const extendDeadline = useCallback(
		async (pesertaDidikId: number, newDeadline: string) => {
			try {
				setLoading(true);
				await tugasDetailService.extendDeadline(
					tugasId,
					pesertaDidikId,
					newDeadline,
				);
				showSuccess("Deadline berhasil diperpanjang");
			} catch (error: any) {
				showError(error.message || "Gagal memperpanjang deadline");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[tugasId, showSuccess, showError],
	);

	// STATISTICS
	const getStatistics = useCallback(async () => {
		try {
			setLoading(true);
			return await tugasDetailService.getTugasStatistics(tugasId);
		} catch (error: any) {
			showError(error.message || "Gagal memuat statistik");
			throw error;
		} finally {
			setLoading(false);
		}
	}, [tugasId, showError]);

	// EXPORT
	const exportGrades = useCallback(async () => {
		try {
			setLoading(true);
			const blob = await tugasDetailService.exportGradeToCSV(tugasId);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `nilai-tugas-${tugasId}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			showSuccess("File berhasil diunduh");
		} catch (error: any) {
			showError(error.message || "Gagal mengunduh file");
		} finally {
			setLoading(false);
		}
	}, [tugasId, showSuccess, showError]);

	return {
		loading,
		// Soal
		addSoal,
		deleteSoal,
		updateSoal,
		// Grading
		gradeStudent,
		reopenJawaban,
		// Tugas
		publishTugas,
		closeTugas,
		allowResubmit,
		extendDeadline,
		// Statistics & Export
		getStatistics,
		exportGrades,
	};
};

/**
 * Hook untuk manage kuis detail operations
 */
export const useKuisDetail = (kuisId: number, materiId: number) => {
	const { showSuccess, showError } = useNotification();
	const [loading, setLoading] = useState(false);

	// SOAL OPERATIONS
	const addSoal = useCallback(
		async (pertanyaan: string, bobot: number) => {
			try {
				setLoading(true);
				const result = await kuisDetailService.createSoalEsai(
					kuisId,
					materiId,
					{
						pertanyaan,
						bobot,
					},
				);
				showSuccess("Soal berhasil ditambahkan");
				return result;
			} catch (error: any) {
				showError(error.message || "Gagal menambahkan soal");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[kuisId, materiId, showSuccess, showError],
	);

	const deleteSoal = useCallback(
		async (soalId: number) => {
			try {
				setLoading(true);
				await kuisDetailService.deleteSoalEsai(soalId);
				showSuccess("Soal berhasil dihapus");
			} catch (error: any) {
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal menghapus soal");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[showSuccess, showError],
	);

	const updateSoal = useCallback(
		async (soalId: number, pertanyaan: string, bobot: number) => {
			try {
				setLoading(true);
				const result = await kuisDetailService.updateSoalEsai(soalId, {
					pertanyaan,
					bobot,
				});
				showSuccess("Soal berhasil diperbarui");
				return result;
			} catch (error: any) {
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal memperbarui soal");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[showSuccess, showError],
	);

	// GRADING OPERATIONS
	const gradeStudent = useCallback(
		async (
			pesertaDidikId: number,
			grades: Array<{ jawabanId: number; nilai: number; catatanGuru?: string }>,
		) => {
			try {
				setLoading(true);
				await kuisDetailService.gradeStudentKuis(
					kuisId,
					pesertaDidikId,
					grades,
				);
				showSuccess("Nilai berhasil disimpan");
			} catch (error: any) {
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal menyimpan nilai");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[kuisId, showSuccess, showError],
	);

	const reopenJawaban = useCallback(
		async (jawabanId: number) => {
			try {
				setLoading(true);
				await kuisDetailService.reopenJawabanEsai(jawabanId);
				showSuccess("Jawaban berhasil dibuka kembali");
			} catch (error: any) {
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal membuka jawaban");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[showSuccess, showError],
	);

	// KUIS OPERATIONS
	const publishKuis = useCallback(async () => {
		try {
			setLoading(true);
			await kuisDetailService.publishKuis(kuisId);
			showSuccess("Kuis berhasil dipublikasikan");
		} catch (error: any) {
			if (error.response?.status !== 401 && error.response?.status !== 403) {
				showError(error.message || "Gagal mempublikasikan kuis");
			}
			throw error;
		} finally {
			setLoading(false);
		}
	}, [kuisId, showSuccess, showError]);

	const closeKuis = useCallback(async () => {
		try {
			setLoading(true);
			await kuisDetailService.closeKuis(kuisId);
			showSuccess("Kuis berhasil ditutup");
		} catch (error: any) {
			if (error.response?.status !== 401 && error.response?.status !== 403) {
				showError(error.message || "Gagal menutup kuis");
			}
			throw error;
		} finally {
			setLoading(false);
		}
	}, [kuisId, showSuccess, showError]);

	const allowRetake = useCallback(
		async (pesertaDidikId: number) => {
			try {
				setLoading(true);
				await kuisDetailService.allowRetake(kuisId, pesertaDidikId);
				showSuccess("Pengulangan kuis diizinkan");
			} catch (error: any) {
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal mengizinkan pengulangan");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[kuisId, showSuccess, showError],
	);

	const extendDeadline = useCallback(
		async (pesertaDidikId: number, newDeadline: string) => {
			try {
				setLoading(true);
				await kuisDetailService.extendDeadline(
					kuisId,
					pesertaDidikId,
					newDeadline,
				);
				showSuccess("Deadline berhasil diperpanjang");
			} catch (error: any) {
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal memperpanjang deadline");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[kuisId, showSuccess, showError],
	);

	// STATISTICS
	const getStatistics = useCallback(async () => {
		try {
			setLoading(true);
			return await kuisDetailService.getKuisStatistics(kuisId);
		} catch (error: any) {
			if (error.response?.status !== 401 && error.response?.status !== 403) {
				showError(error.message || "Gagal memuat statistik");
			}
			throw error;
		} finally {
			setLoading(false);
		}
	}, [kuisId, showError]);

	const getScore = useCallback(
		async (pesertaDidikId: number) => {
			try {
				setLoading(true);
				return await kuisDetailService.getStudentKuisScore(
					kuisId,
					pesertaDidikId,
				);
			} catch (error: any) {
				if (error.response?.status !== 401 && error.response?.status !== 403) {
					showError(error.message || "Gagal memuat skor");
				}
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[kuisId, showError],
	);

	// EXPORT
	const exportGrades = useCallback(async () => {
		try {
			setLoading(true);
			const blob = await kuisDetailService.exportGradeToCSV(kuisId);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `nilai-kuis-${kuisId}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			showSuccess("File berhasil diunduh");
		} catch (error: any) {
			if (error.response?.status !== 401 && error.response?.status !== 403) {
				showError(error.message || "Gagal mengunduh file");
			}
		} finally {
			setLoading(false);
		}
	}, [kuisId, showSuccess, showError]);

	const generateReport = useCallback(async () => {
		try {
			setLoading(true);
			return await kuisDetailService.generateKuisReport(kuisId);
		} catch (error: any) {
			if (error.response?.status !== 401 && error.response?.status !== 403) {
				showError(error.message || "Gagal membuat laporan");
			}
			throw error;
		} finally {
			setLoading(false);
		}
	}, [kuisId, showError]);

	return {
		loading,
		// Soal
		addSoal,
		deleteSoal,
		updateSoal,
		// Grading
		gradeStudent,
		reopenJawaban,
		// Kuis
		publishKuis,
		closeKuis,
		allowRetake,
		extendDeadline,
		// Statistics & Export
		getStatistics,
		getScore,
		exportGrades,
		generateReport,
	};
};
