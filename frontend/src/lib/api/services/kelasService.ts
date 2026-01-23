import axiosInstance from "@/lib/api/axiosInstance";

interface Kelas {
	id: number;
	nama: string;
	tingkat: string;
	kapasitas: number;
	status?: string;
	waliKelasId?: number;
	guruWaliId?: number;
	createdAt?: string;
	guruWali?: {
		id: number;
		namaLengkap: string;
		nip: string;
	};
	siswa?: Array<{
		id: number;
		nisn: string;
		namaLengkap: string;
		jenisKelamin: string;
	}>;
	guruMapel?: Array<{
		id: number;
		namaLengkap: string;
		nip: string;
		kelasMapel?: string[];
	}>;
	mataPelajaran?: Array<{
		id: number;
		nama: string;
		deskripsi?: string;
	}>;
}

interface CreateKelasRequest {
	nama: string;
	tingkat: string;
	kapasitas?: number;
}

interface UpdateKelasRequest {
	nama?: string;
	tingkat?: string;
	kapasitas?: number;
	guruWaliId?: number | null;
}

interface PaginatedResponse<T> {
	data: T[];
	pagination?: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
}

class KelasService {
	async getAllKelas(
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedResponse<Kelas>> {
		const response = await axiosInstance.get<PaginatedResponse<Kelas>>(
			"/admin/kelas",
			{
				params: { page, limit },
			},
		);
		return response.data;
	}

	async getKelasById(id: number): Promise<{ data: Kelas }> {
		const response = await axiosInstance.get<{ data: Kelas }>(
			`/admin/kelas/${id}`,
		);
		return response.data;
	}

	async createKelas(data: CreateKelasRequest): Promise<{ data: Kelas }> {
		const response = await axiosInstance.post<{ data: Kelas }>(
			"/admin/kelas",
			data,
		);
		return response.data;
	}

	async updateKelas(
		id: number,
		data: UpdateKelasRequest,
	): Promise<{ data: Kelas }> {
		const response = await axiosInstance.put<{ data: Kelas }>(
			`/admin/kelas/${id}`,
			data,
		);
		return response.data;
	}

	async deleteKelas(id: number): Promise<{ message: string }> {
		const response = await axiosInstance.delete<{ message: string }>(
			`/admin/kelas/${id}`,
		);
		return response.data;
	}

	async getKelasDropdown(): Promise<{ data: Kelas[] }> {
		const response = await axiosInstance.get<{ data: Kelas[] }>(
			"/admin/kelas/dropdown/all",
		);
		return response.data;
	}

	// Guru Mapel Management
	async assignGuruToKelas(
		kelasId: number,
		guruId: number,
	): Promise<{ message: string }> {
		const response = await axiosInstance.post<{ message: string }>(
			`/admin/kelas/${kelasId}/guru-mapel/${guruId}`,
		);
		return response.data;
	}

	async removeGuruFromKelas(
		kelasId: number,
		guruId: number,
	): Promise<{ message: string }> {
		const response = await axiosInstance.delete<{ message: string }>(
			`/admin/kelas/${kelasId}/guru-mapel/${guruId}`,
		);
		return response.data;
	}

	// Students Management
	async addStudentToKelas(
		studentId: number,
		kelasId: number,
	): Promise<{ message: string }> {
		const response = await axiosInstance.put<{ message: string }>(
			`/admin/students/${studentId}`,
			{ kelasId },
		);
		return response.data;
	}

	async getAvailableStudents(): Promise<{
		data: Array<{
			id: number;
			nisn: string;
			namaLengkap: string;
			jenisKelamin: string;
		}>;
	}> {
		const response = await axiosInstance.get<{
			data: Array<{
				id: number;
				nisn: string;
				namaLengkap: string;
				jenisKelamin: string;
			}>;
		}>("/admin/students/available");
		return response.data;
	}

	async assignWaliGuru(
		kelasId: number,
		guruId: number,
	): Promise<{ message: string }> {
		const response = await axiosInstance.put<{ message: string }>(
			`/admin/kelas/${kelasId}/assign-wali-guru/${guruId}`,
		);
		return response.data;
	}

	async removeWaliKelas(kelasId: number): Promise<{ message: string }> {
		const response = await axiosInstance.delete<{ message: string }>(
			`/admin/kelas/${kelasId}/wali-kelas`,
		);
		return response.data;
	}

	async removeStudentFromKelas(
		studentId: number,
		kelasId: number,
	): Promise<{ message: string }> {
		const response = await axiosInstance.put<{ message: string }>(
			`/admin/students/${studentId}`,
			{ kelasId: null },
		);
		return response.data;
	}
}

export default new KelasService();
