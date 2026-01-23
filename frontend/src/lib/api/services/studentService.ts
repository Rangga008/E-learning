import axiosInstance from "@/lib/api/axiosInstance";

interface Student {
	id: number;
	nisn: string;
	namaLengkap: string;
	jenisKelamin: string;
	kelasId?: number;
	kelas?: {
		id: number;
		nama: string;
		tingkatRef?: {
			nama: string;
		};
		tingkat?: string;
	};
	level?: number;
	poin?: number;
	userId?: number;
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

interface CreateStudentRequest {
	nisn: string;
	namaLengkap: string;
	jenisKelamin: "L" | "P";
	kelasId?: number;
}

class StudentService {
	async getAllStudents(
		page: number = 1,
		limit: number = 10,
		search?: string,
	): Promise<PaginatedResponse<Student>> {
		const params: any = { page, limit };
		if (search) {
			params.search = search;
		}
		const response = await axiosInstance.get<PaginatedResponse<Student>>(
			"/peserta-didik",
			{
				params,
			},
		);
		return response.data;
	}

	async getStudentById(id: number): Promise<{ data: Student }> {
		const response = await axiosInstance.get<{ data: Student }>(
			`/peserta-didik/${id}`,
		);
		return response.data;
	}

	async getAvailableStudents(kelasId?: number): Promise<{ data: Student[] }> {
		const response = await axiosInstance.get<{ data: Student[] }>(
			"/peserta-didik/available/list",
			{
				params: kelasId ? { kelasId } : undefined,
			},
		);
		return response.data;
	}

	async createStudent(data: CreateStudentRequest): Promise<{ data: Student }> {
		const response = await axiosInstance.post<{ data: Student }>(
			"/peserta-didik",
			data,
		);
		return response.data;
	}

	async updateStudent(
		id: number,
		data: Partial<Student & CreateStudentRequest>,
	): Promise<{ data: Student }> {
		const response = await axiosInstance.put<{ data: Student }>(
			`/peserta-didik/${id}`,
			data,
		);
		return response.data;
	}

	async deleteStudent(id: number): Promise<{ message: string }> {
		const response = await axiosInstance.delete<{ message: string }>(
			`/peserta-didik/${id}`,
		);
		return response.data;
	}

	async getStudentByKelas(kelasId: number): Promise<{ data: Student[] }> {
		const response = await axiosInstance.get<{ data: Student[] }>(
			`/peserta-didik/kelas/${kelasId}`,
		);
		return response.data;
	}

	async removeStudentFromKelas(
		studentId: number,
		kelasId: number,
	): Promise<{ message: string }> {
		// This endpoint is handled via kelas service, not peserta-didik
		// Update kelas to remove student
		const response = await axiosInstance.put<{ message: string }>(
			`/kelas/${kelasId}/remove-student/${studentId}`,
		);
		return response.data;
	}

	async importStudents(data: any[]): Promise<{ data: any }> {
		const response = await axiosInstance.post<{ data: any }>(
			"/admin/students/import",
			{ data },
		);
		return response.data;
	}
}

export default new StudentService();
