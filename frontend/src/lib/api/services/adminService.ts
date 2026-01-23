import axiosInstance from "@/lib/api/axiosInstance";

interface User {
	id: number;
	username: string;
	email: string;
	fullName: string;
	role: string;
	isActive: boolean;
	createdAt?: string;
}

interface CreateUserRequest {
	username: string;
	email: string;
	fullName: string;
	password: string;
	role: "siswa" | "guru" | "admin";
	nisn?: string;
	nip?: string;
	jenisKelamin?: string;
	kelasId?: number;
	kelasWaliId?: number;
	kelasMapel?: number[];
}

interface UpdateUserRequest {
	username?: string;
	email?: string;
	fullName?: string;
	nisn?: string;
	nip?: string;
	jenisKelamin?: string;
	kelasId?: number;
	kelasWaliId?: number;
	kelasMapel?: number[];
}

interface Teacher {
	id: number;
	nip: string;
	namaLengkap: string;
	kelasMapel?: string[];
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

class AdminService {
	// Users
	async getAllUsers(
		page: number = 1,
		limit: number = 10,
		search?: string,
		role?: string,
	): Promise<PaginatedResponse<User>> {
		const response = await axiosInstance.get<PaginatedResponse<User>>(
			"/admin/users",
			{
				params: { page, limit, search, role },
			},
		);
		return response.data;
	}

	async getUserById(id: number): Promise<{ data: User }> {
		const response = await axiosInstance.get<{ data: User }>(
			`/admin/users/${id}`,
		);
		return response.data;
	}

	async createUser(data: CreateUserRequest): Promise<{ data: User }> {
		const response = await axiosInstance.post<{ data: User }>(
			"/admin/users",
			data,
		);
		return response.data;
	}

	async updateUser(
		id: number,
		data: UpdateUserRequest,
	): Promise<{ data: User }> {
		const response = await axiosInstance.put<{ data: User }>(
			`/admin/users/${id}`,
			data,
		);
		return response.data;
	}

	async deleteUser(id: number): Promise<{ message: string }> {
		const response = await axiosInstance.post<{ message: string }>(
			`/admin/users/${id}/delete`,
		);
		return response.data;
	}

	async updateUserStatus(
		id: number,
		isActive: boolean,
	): Promise<{ message: string }> {
		const response = await axiosInstance.put<{ message: string }>(
			`/admin/users/${id}/status`,
			{ isActive },
		);
		return response.data;
	}

	async resetUserPassword(
		id: number,
		newPassword: string,
	): Promise<{ message: string }> {
		const response = await axiosInstance.put<{ message: string }>(
			`/admin/users/${id}/reset-password`,
			{ newPassword },
		);
		return response.data;
	}

	// Teachers
	async getAllTeachers(
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedResponse<Teacher>> {
		const response = await axiosInstance.get<PaginatedResponse<Teacher>>(
			"/admin/teachers",
			{
				params: { page, limit },
			},
		);
		return response.data;
	}

	async getTeacherById(id: number): Promise<{ data: Teacher }> {
		const response = await axiosInstance.get<{ data: Teacher }>(
			`/admin/teachers/${id}`,
		);
		return response.data;
	}

	async getTeachersDropdown(): Promise<{ data: Teacher[] }> {
		const response = await axiosInstance.get<{ data: Teacher[] }>(
			"/admin/teachers/dropdown/all",
		);
		return response.data;
	}

	// Statistics
	async getSystemStatistics(): Promise<{
		data: {
			totalSiswa: number;
			totalGuru: number;
			totalUserAktif: number;
			totalUser: number;
		};
	}> {
		const response = await axiosInstance.get<{
			data: {
				totalSiswa: number;
				totalGuru: number;
				totalUserAktif: number;
				totalUser: number;
			};
		}>("/admin/statistics");
		return response.data;
	}
}

export default new AdminService();
