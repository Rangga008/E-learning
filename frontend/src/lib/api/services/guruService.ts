import axiosInstance from "@/lib/api/axiosInstance";

interface Guru {
	id: number;
	nip: string;
	namaLengkap: string;
	email: string;
	jenisKelamin: string;
	userId?: number;
	kelasMapel?: string[];
	createdAt?: string;
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

interface CreateGuruRequest {
	nip: string;
	namaLengkap: string;
	email: string;
	jenisKelamin: "L" | "P";
	kelasMapel?: string[];
}

interface UpdateGuruRequest {
	nip?: string;
	namaLengkap?: string;
	email?: string;
	jenisKelamin?: "L" | "P";
	kelasMapel?: string[];
}

class GuruService {
	async getAllGuru(
		page: number = 1,
		limit: number = 10,
		search?: string,
	): Promise<PaginatedResponse<Guru>> {
		const response = await axiosInstance.get<PaginatedResponse<Guru>>(
			"/admin/teachers",
			{
				params: { page, limit, search },
			},
		);
		return response.data;
	}

	async getGuruById(id: number): Promise<{ data: Guru }> {
		const response = await axiosInstance.get<{ data: Guru }>(
			`/admin/teachers/${id}`,
		);
		return response.data;
	}

	async createGuru(data: CreateGuruRequest): Promise<{ data: Guru }> {
		const response = await axiosInstance.post<{ data: Guru }>(
			"/admin/teachers",
			data,
		);
		return response.data;
	}

	async updateGuru(
		id: number,
		data: UpdateGuruRequest,
	): Promise<{ data: Guru }> {
		const response = await axiosInstance.put<{ data: Guru }>(
			`/admin/teachers/${id}`,
			data,
		);
		return response.data;
	}

	async deleteGuru(id: number): Promise<{ message: string }> {
		const response = await axiosInstance.post<{ message: string }>(
			`/admin/teachers/${id}/delete`,
		);
		return response.data;
	}

	async updateGuruKelasMapel(
		guruId: number,
		kelasMapel: string[],
	): Promise<{ data: Guru }> {
		const response = await axiosInstance.put<{ data: Guru }>(
			`/admin/teachers/${guruId}`,
			{ kelasMapel },
		);
		return response.data;
	}

	async getTeachersStats(): Promise<{ data: any }> {
		const response = await axiosInstance.get<{ data: any }>(
			"/admin/teachers/stats/all",
		);
		return response.data;
	}

	async assignClasses(
		guruId: number,
		classIds: number[],
	): Promise<{ message: string }> {
		const response = await axiosInstance.post<{ message: string }>(
			`/admin/teachers/${guruId}/assign-classes`,
			{ classIds },
		);
		return response.data;
	}

	async importTeachers(data: any[]): Promise<{ data: any }> {
		const response = await axiosInstance.post<{ data: any }>(
			"/admin/teachers/import",
			{ data },
		);
		return response.data;
	}
}

export default new GuruService();
