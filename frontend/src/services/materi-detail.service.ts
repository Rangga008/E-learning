import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const axiosInstance = axios.create({
	baseURL: API_BASE,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add token interceptor
axiosInstance.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// ============= MATERI DETAIL =============
export const materiDetailService = {
	// Get materi by ID with all related data (rencana, konten, tugas, kuis)
	getMateriDetail: async (materiId: number) => {
		const response = await axiosInstance.get(`/elearning/materi/${materiId}`);
		return response.data;
	},

	// Update materi (title, description, status)
	updateMateri: async (
		materiId: number,
		data: {
			judulMateri?: string;
			deskripsi?: string;
			status?: string;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/materi/${materiId}`,
			data,
		);
		return response.data;
	},

	// ============= RENCANA PEMBELAJARAN =============
	getRencana: async (materiId: number) => {
		const response = await axiosInstance.get(
			`/elearning/materi/${materiId}/rencana`,
		);
		return response.data;
	},

	createRencana: async (
		materiId: number,
		data: {
			rencana: string;
		},
	) => {
		const response = await axiosInstance.post(
			`/elearning/materi/${materiId}/rencana`,
			data,
		);
		return response.data;
	},

	updateRencana: async (
		materiId: number,
		data: {
			rencana: string;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/materi/${materiId}/rencana`,
			data,
		);
		return response.data;
	},

	// ============= KONTEN MATERI =============
	getKontenList: async (materiId: number) => {
		const response = await axiosInstance.get(
			`/elearning/materi/${materiId}/konten`,
		);
		return response.data;
	},

	createKonten: async (
		materiId: number,
		data: {
			tipeKonten: "TEXT" | "VIDEO" | "FILE";
			judul: string;
			kontenTeks?: string;
			linkVideo?: string;
			filePath?: string;
		},
	) => {
		const response = await axiosInstance.post(
			`/elearning/materi/${materiId}/konten`,
			data,
		);
		return response.data;
	},

	updateKonten: async (
		materiId: number,
		kontenId: number,
		data: {
			judul?: string;
			kontenTeks?: string;
			linkVideo?: string;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/materi/${materiId}/konten/${kontenId}`,
			data,
		);
		return response.data;
	},

	deleteKonten: async (materiId: number, kontenId: number) => {
		const response = await axiosInstance.delete(
			`/elearning/materi/${materiId}/konten/${kontenId}`,
		);
		return response.data;
	},

	// Upload file konten
	uploadKontenFile: async (materiId: number, file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await axiosInstance.post(
			`/elearning/materi/${materiId}/konten/upload`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);
		return response.data;
	},

	// ============= TUGAS =============
	getTugasList: async (materiId: number) => {
		const response = await axiosInstance.get(
			`/elearning/materi/${materiId}/tugas`,
		);
		return response.data;
	},

	createTugas: async (
		materiId: number,
		data: {
			judulTugas: string;
			deskripsi: string;
			tipe: "UPLOAD" | "ESAI";
			deadline?: string;
			status?: string;
		},
	) => {
		const response = await axiosInstance.post(
			`/elearning/materi/${materiId}/tugas`,
			data,
		);
		return response.data;
	},

	updateTugas: async (
		materiId: number,
		tugasId: number,
		data: {
			judulTugas?: string;
			deskripsi?: string;
			deadline?: string;
			status?: string;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/materi/${materiId}/tugas/${tugasId}`,
			data,
		);
		return response.data;
	},

	deleteTugas: async (materiId: number, tugasId: number) => {
		const response = await axiosInstance.delete(
			`/elearning/materi/${materiId}/tugas/${tugasId}`,
		);
		return response.data;
	},

	getTugasDetail: async (materiId: number, tugasId: number) => {
		const response = await axiosInstance.get(
			`/elearning/materi/${materiId}/tugas/${tugasId}`,
		);
		return response.data;
	},

	// ============= SOAL ESAI (KUIS) =============
	getSoalEsaiList: async (tugasId: number) => {
		const response = await axiosInstance.get(
			`/elearning/tugas/${tugasId}/soal-esai`,
		);
		return response.data;
	},

	createSoalEsai: async (
		tugasId: number,
		data: {
			pertanyaan: string;
			bobot: number;
		},
	) => {
		const response = await axiosInstance.post(
			`/elearning/tugas/${tugasId}/soal-esai`,
			data,
		);
		return response.data;
	},

	updateSoalEsai: async (
		tugasId: number,
		soalId: number,
		data: {
			pertanyaan?: string;
			bobot?: number;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/tugas/${tugasId}/soal-esai/${soalId}`,
			data,
		);
		return response.data;
	},

	deleteSoalEsai: async (tugasId: number, soalId: number) => {
		const response = await axiosInstance.delete(
			`/elearning/tugas/${tugasId}/soal-esai/${soalId}`,
		);
		return response.data;
	},

	// ============= PENGATURAN VISIBILITY =============
	updateMateriVisibility: async (
		materiId: number,
		data: {
			visible: boolean;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/materi/${materiId}/visibility`,
			data,
		);
		return response.data;
	},

	updateTugasVisibility: async (
		tugasId: number,
		data: {
			visible: boolean;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/tugas/${tugasId}/visibility`,
			data,
		);
		return response.data;
	},

	updateKuisVisibility: async (
		tugasId: number,
		data: {
			visible: boolean;
		},
	) => {
		const response = await axiosInstance.put(
			`/elearning/tugas/${tugasId}/kuis-visibility`,
			data,
		);
		return response.data;
	},

	// ============= STUDENT VIEW =============
	// Get materi details for student (only published content)
	getMateriForStudent: async (materiId: number) => {
		const response = await axiosInstance.get(
			`/elearning/siswa/materi/${materiId}`,
		);
		return response.data;
	},

	// Get tugas for student
	getTugasForStudent: async (tugasId: number) => {
		const response = await axiosInstance.get(
			`/elearning/siswa/tugas/${tugasId}`,
		);
		return response.data;
	},

	// Student submit tugas jawaban
	submitJawabanTugas: async (
		tugasId: number,
		data: {
			jawabanTeks?: string;
		},
	) => {
		const response = await axiosInstance.post(
			`/elearning/siswa/tugas/${tugasId}/jawab`,
			data,
		);
		return response.data;
	},

	// Student submit tugas file
	submitJawabanTugasFile: async (tugasId: number, file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await axiosInstance.post(
			`/elearning/siswa/tugas/${tugasId}/jawab-file`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);
		return response.data;
	},

	// Student submit kuis (soal esai)
	submitJawabanEsai: async (
		soalEsaiId: number,
		data: {
			jawaban: string;
		},
	) => {
		const response = await axiosInstance.post(
			`/elearning/siswa/soal-esai/${soalEsaiId}/jawab`,
			data,
		);
		return response.data;
	},

	// Get student's jawaban for a soal esai
	getJawabanEsaiStudent: async (soalEsaiId: number) => {
		const response = await axiosInstance.get(
			`/elearning/siswa/soal-esai/${soalEsaiId}/jawaban`,
		);
		return response.data;
	},
};

export default materiDetailService;
