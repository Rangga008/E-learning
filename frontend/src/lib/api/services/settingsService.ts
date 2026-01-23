import axiosInstance from "@/lib/api/axiosInstance";

interface Settings {
	id?: number;
	key: string;
	value: any;
}

interface Tingkat {
	id: number;
	nama: string;
	urutan: number;
	deskripsi?: string;
	isActive: boolean;
	createdAt?: string;
}

interface Angkatan {
	id: number;
	nama: string;
	tahun: number;
	keterangan?: string;
	isActive: boolean;
	createdAt?: string;
}

class SettingsService {
	async getSettings(): Promise<{ data: Settings[] }> {
		const response = await axiosInstance.get<{ data: Settings[] }>("/settings");
		return response.data;
	}

	async updateSettings(settings: Settings[]): Promise<{ data: Settings[] }> {
		const response = await axiosInstance.put<{ data: Settings[] }>(
			"/settings",
			{ settings },
		);
		return response.data;
	}

	async getTingkatList(): Promise<{ data: Tingkat[] }> {
		const response = await axiosInstance.get<{ data: Tingkat[] }>(
			"/settings/tingkat",
		);
		return response.data;
	}

	async createTingkat(data: Omit<Tingkat, "id" | "createdAt">): Promise<{
		data: Tingkat;
	}> {
		const response = await axiosInstance.post<{ data: Tingkat }>(
			"/settings/tingkat",
			data,
		);
		return response.data;
	}

	async updateTingkat(
		id: number,
		data: Partial<Omit<Tingkat, "id" | "createdAt">>,
	): Promise<{ data: Tingkat }> {
		const response = await axiosInstance.put<{ data: Tingkat }>(
			`/settings/tingkat/${id}`,
			data,
		);
		return response.data;
	}

	async deleteTingkat(id: number): Promise<{ message: string }> {
		const response = await axiosInstance.delete<{ message: string }>(
			`/settings/tingkat/${id}`,
		);
		return response.data;
	}

	async getAngkatanList(): Promise<{ data: Angkatan[] }> {
		const response = await axiosInstance.get<{ data: Angkatan[] }>(
			"/settings/angkatan",
		);
		return response.data;
	}

	async createAngkatan(
		data: Omit<Angkatan, "id" | "createdAt">,
	): Promise<{ data: Angkatan }> {
		const response = await axiosInstance.post<{ data: Angkatan }>(
			"/settings/angkatan",
			data,
		);
		return response.data;
	}

	async updateAngkatan(
		id: number,
		data: Partial<Omit<Angkatan, "id" | "createdAt">>,
	): Promise<{ data: Angkatan }> {
		const response = await axiosInstance.put<{ data: Angkatan }>(
			`/settings/angkatan/${id}`,
			data,
		);
		return response.data;
	}

	async deleteAngkatan(id: number): Promise<{ message: string }> {
		const response = await axiosInstance.delete<{ message: string }>(
			`/settings/angkatan/${id}`,
		);
		return response.data;
	}
}

export default new SettingsService();
