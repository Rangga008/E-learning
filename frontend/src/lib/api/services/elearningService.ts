import axiosInstance from "@/lib/api/axiosInstance";

interface MataPelajaran {
	id: number;
	nama: string;
	deskripsi?: string;
	guruId?: number;
	guru?: {
		id: number;
		namaLengkap: string;
	};
	createdAt?: string;
	updatedAt?: string;
}

class ElearningService {
	async getMataPelajaranDropdown(): Promise<{ data: MataPelajaran[] }> {
		const response = await axiosInstance.get<
			MataPelajaran[] | { data: MataPelajaran[] }
		>("/elearning/dropdown/mata-pelajaran");
		// Handle both array and { data: [] } response formats
		const data = Array.isArray(response.data)
			? response.data
			: response.data.data || [];
		return { data };
	}

	async getMataPelajaranByKelas(kelasId?: number): Promise<{
		data: MataPelajaran[];
	}> {
		const response = await axiosInstance.get<{ data: MataPelajaran[] }>(
			"/elearning/dropdown/mata-pelajaran",
			{
				params: kelasId ? { kelas: kelasId } : {},
			},
		);
		return response.data;
	}

	async getAllMataPelajaran(): Promise<{ data: MataPelajaran[] }> {
		try {
			const response = await axiosInstance.get<any>(
				"/elearning/mata-pelajaran",
			);
			// Handle both array and { data: [] } response formats
			const data = Array.isArray(response.data)
				? response.data
				: Array.isArray(response.data?.data)
				? response.data.data
				: [];
			console.log("getAllMataPelajaran response:", {
				original: response.data,
				processed: data,
			});
			return { data };
		} catch (error) {
			console.error("getAllMataPelajaran error:", error);
			throw error;
		}
	}

	async createMataPelajaran(data: { nama: string }): Promise<MataPelajaran> {
		try {
			const response = await axiosInstance.post<any>(
				"/elearning/mata-pelajaran",
				data,
			);
			// Handle both direct object and { data: {} } response formats
			const result = response.data?.data || response.data;
			console.log("createMataPelajaran response:", {
				original: response.data,
				processed: result,
			});
			return result;
		} catch (error) {
			console.error("createMataPelajaran error:", error);
			throw error;
		}
	}

	async updateMataPelajaran(
		id: number,
		data: Partial<MataPelajaran>,
	): Promise<{ data: MataPelajaran }> {
		const response = await axiosInstance.put<{ data: MataPelajaran }>(
			`/elearning/mata-pelajaran/${id}`,
			data,
		);
		return response.data;
	}

	async deleteMataPelajaran(id: number): Promise<{ message: string }> {
		const response = await axiosInstance.delete<{ message: string }>(
			`/elearning/mata-pelajaran/${id}`,
		);
		return response.data;
	}

	// Materi methods
	async getMateriByMapel(mapelId: number): Promise<any[]> {
		try {
			const response = await axiosInstance.get<any>(
				`/elearning/guru/materi/${mapelId}`,
			);
			return Array.isArray(response.data)
				? response.data
				: response.data?.data || [];
		} catch (error) {
			console.error("getMateriByMapel error:", error);
			throw error;
		}
	}

	async getMateriDetail(materiId: number): Promise<any> {
		try {
			const response = await axiosInstance.get<any>(
				`/elearning/materi/${materiId}`,
			);
			return response.data;
		} catch (error) {
			console.error("getMateriDetail error:", error);
			throw error;
		}
	}

	async createMateri(data: FormData): Promise<any> {
		try {
			const response = await axiosInstance.post<any>(
				"/elearning/materi",
				data,
				{
					headers: { "Content-Type": "multipart/form-data" },
				},
			);
			return response.data;
		} catch (error) {
			console.error("createMateri error:", error);
			throw error;
		}
	}

	async updateMateri(materiId: number, data: FormData): Promise<any> {
		try {
			const response = await axiosInstance.put<any>(
				`/elearning/materi/${materiId}`,
				data,
				{
					headers: { "Content-Type": "multipart/form-data" },
				},
			);
			return response.data;
		} catch (error) {
			console.error("updateMateri error:", error);
			throw error;
		}
	}

	async deleteMateri(materiId: number): Promise<any> {
		try {
			const response = await axiosInstance.delete<any>(
				`/elearning/materi/${materiId}`,
			);
			return response.data;
		} catch (error) {
			console.error("deleteMateri error:", error);
			throw error;
		}
	}

	async publishMateri(materiId: number): Promise<any> {
		try {
			const response = await axiosInstance.post<any>(
				`/elearning/materi/${materiId}/publish`,
			);
			return response.data;
		} catch (error) {
			console.error("publishMateri error:", error);
			throw error;
		}
	}

	async closeMateri(materiId: number): Promise<any> {
		try {
			const response = await axiosInstance.post<any>(
				`/elearning/materi/${materiId}/close`,
			);
			return response.data;
		} catch (error) {
			console.error("closeMateri error:", error);
			throw error;
		}
	}

	// Tugas methods
	async getTugasByMateri(materiId: number): Promise<any[]> {
		try {
			const response = await axiosInstance.get<any>(
				`/elearning/guru/tugas/${materiId}`,
			);
			return Array.isArray(response.data)
				? response.data
				: response.data?.data || [];
		} catch (error) {
			console.error("getTugasByMateri error:", error);
			throw error;
		}
	}

	async getTugasDetail(tugasId: number): Promise<any> {
		try {
			const response = await axiosInstance.get<any>(
				`/elearning/tugas/${tugasId}`,
			);
			return response.data;
		} catch (error) {
			console.error("getTugasDetail error:", error);
			throw error;
		}
	}

	async createTugas(data: any): Promise<any> {
		try {
			const response = await axiosInstance.post<any>("/elearning/tugas", data);
			return response.data;
		} catch (error) {
			console.error("createTugas error:", error);
			throw error;
		}
	}

	async updateTugas(tugasId: number, data: any): Promise<any> {
		try {
			const response = await axiosInstance.put<any>(
				`/elearning/tugas/${tugasId}`,
				data,
			);
			return response.data;
		} catch (error) {
			console.error("updateTugas error:", error);
			throw error;
		}
	}

	async deleteTugas(tugasId: number): Promise<any> {
		try {
			const response = await axiosInstance.delete<any>(
				`/elearning/tugas/${tugasId}`,
			);
			return response.data;
		} catch (error) {
			console.error("deleteTugas error:", error);
			throw error;
		}
	}

	async publishTugas(tugasId: number): Promise<any> {
		try {
			const response = await axiosInstance.post<any>(
				`/elearning/tugas/${tugasId}/publish`,
			);
			return response.data;
		} catch (error) {
			console.error("publishTugas error:", error);
			throw error;
		}
	}

	async closeTugas(tugasId: number): Promise<any> {
		try {
			const response = await axiosInstance.post<any>(
				`/elearning/tugas/${tugasId}/close`,
			);
			return response.data;
		} catch (error) {
			console.error("closeTugas error:", error);
			throw error;
		}
	}
}

export default new ElearningService();
