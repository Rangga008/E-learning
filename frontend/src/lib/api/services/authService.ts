import axiosInstance from "@/lib/api/axiosInstance";

interface LoginRequest {
	username: string;
	password: string;
}

interface RegisterRequest {
	username: string;
	email: string;
	password: string;
	fullName: string;
	role: "siswa" | "guru" | "admin";
}

interface AuthResponse {
	access_token: string;
	user: {
		id: number;
		username: string;
		email: string;
		fullName: string;
		role: string;
		isActive: boolean;
	};
}

class AuthService {
	async login(credentials: LoginRequest): Promise<AuthResponse> {
		const response = await axiosInstance.post<{
			success: boolean;
			message: string;
			data: AuthResponse;
		}>("/auth/login", credentials);
		// Backend returns { success, message, data: { access_token, user } }
		return response.data.data;
	}

	async register(data: RegisterRequest): Promise<{
		success: boolean;
		message: string;
		data?: any;
	}> {
		const response = await axiosInstance.post<{
			success: boolean;
			message: string;
			data?: any;
		}>("/auth/register", data);
		return response.data;
	}

	logout(): void {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	}

	getStoredToken(): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("token");
	}

	setToken(token: string): void {
		if (typeof window !== "undefined") {
			localStorage.setItem("token", token);
		}
	}
}

export default new AuthService();
