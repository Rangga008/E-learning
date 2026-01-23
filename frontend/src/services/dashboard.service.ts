import { apiClient } from "@/utils/apiClient";

export const dashboardService = {
	// Siswa endpoints
	getSiswaStats: async (pesertaDidikId: number) => {
		try {
			const response = await apiClient.get(
				`/peserta-didik/dashboard/stats/${pesertaDidikId}`,
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching siswa stats:", error);
			return null;
		}
	},

	getSiswaMapels: async (pesertaDidikId: number) => {
		try {
			const response = await apiClient.get(
				`/peserta-didik/dashboard/mapels/${pesertaDidikId}`,
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching siswa mapels:", error);
			return null;
		}
	},

	// Guru endpoints
	getGuruStats: async (guruId: number) => {
		try {
			const response = await apiClient.get(`/guru/dashboard/stats/${guruId}`);
			return response.data;
		} catch (error) {
			console.error("Error fetching guru stats:", error);
			return null;
		}
	},

	getAbsentStudents: async (guruId: number) => {
		try {
			const response = await apiClient.get(`/guru/dashboard/absent/${guruId}`);
			return response.data;
		} catch (error) {
			console.error("Error fetching absent students:", error);
			return null;
		}
	},

	getPendingEssays: async (guruId: number) => {
		try {
			const response = await apiClient.get(
				`/guru/dashboard/pending-essays/${guruId}`,
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching pending essays:", error);
			return null;
		}
	},

	// Save essay answer
	submitEssayAnswer: async (
		pesertaDidikId: number,
		soalEsaiId: number,
		jawaban: string,
	) => {
		try {
			const response = await apiClient.post("/jawaban-esai", {
				pesertaDidikId,
				soalEsaiId,
				jawaban,
			});
			return response.data;
		} catch (error) {
			console.error("Error submitting essay answer:", error);
			return null;
		}
	},

	// Save numerasi result
	submitNumerasiResult: async (
		pesertaDidikId: number,
		level: number,
		topik: string,
		jumlahBenar: number,
		jumlahSalah: number,
		nilai: number,
	) => {
		try {
			const response = await apiClient.post("/jawaban-numerasi", {
				pesertaDidikId,
				level,
				topik,
				jumlahBenar,
				jumlahSalah,
				nilai,
				tanggal: new Date(),
				sudahSelesai: true,
			});
			return response.data;
		} catch (error) {
			console.error("Error submitting numerasi result:", error);
			return null;
		}
	},

	// Grade essay
	gradeEssay: async (
		jawabanEsaiId: number,
		nilai: number,
		catatanGuru: string,
	) => {
		try {
			const response = await apiClient.patch(`/jawaban-esai/${jawabanEsaiId}`, {
				nilai,
				catatanGuru,
				sudahDinilai: true,
			});
			return response.data;
		} catch (error) {
			console.error("Error grading essay:", error);
			return null;
		}
	},
};
