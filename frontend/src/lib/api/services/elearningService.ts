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
		const response = await axiosInstance.get<{ data: MataPelajaran[] }>(
			"/elearning/dropdown/mata-pelajaran",
		);
		return response.data;
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
		const response = await axiosInstance.get<{ data: MataPelajaran[] }>(
			"/elearning/mata-pelajaran",
		);
		return response.data;
	}

	async createMataPelajaran(data: {
		nama: string;
	}): Promise<{ data: MataPelajaran }> {
		const response = await axiosInstance.post<{ data: MataPelajaran }>(
			"/elearning/mata-pelajaran",
			data,
		);
		return response.data;
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
}

export default new ElearningService();
