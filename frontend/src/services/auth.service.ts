"use client";

import apiClient from "@/utils/apiClient";
import { LoginData, RegisterData } from "@/types/auth";

export const authService = {
	async login(data: LoginData) {
		const response = await apiClient.post("/auth/login", data);
		// Backend returns: { success: true, message: "...", data: { access_token, user } }
		const loginData = response.data.data || response.data;
		if (loginData?.access_token) {
			localStorage.setItem("token", loginData.access_token);
			localStorage.setItem("user", JSON.stringify(loginData.user));
		}
		return loginData;
	},

	async register(data: RegisterData) {
		const response = await apiClient.post("/auth/register", data);
		return response.data.data || response.data;
	},

	logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},

	getToken() {
		return typeof window !== "undefined" ? localStorage.getItem("token") : null;
	},

	getUser() {
		if (typeof window !== "undefined") {
			const user = localStorage.getItem("user");
			return user ? JSON.parse(user) : null;
		}
		return null;
	},
};
