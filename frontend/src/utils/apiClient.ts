"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Handle 401 errors (token expired or invalid)
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token invalid or expired
			if (typeof window !== "undefined") {
				// Clear auth data from localStorage immediately
				localStorage.removeItem("token");
				localStorage.removeItem("user");

				// Dispatch event to trigger auth store update
				try {
					const event = new Event("auth-expired");
					window.dispatchEvent(event);
				} catch (e) {
					console.error("Failed to dispatch auth-expired event:", e);
				}

				// Redirect to login ONLY if not already there
				// Use setTimeout to allow event to propagate first
				if (!window.location.pathname.startsWith("/auth/login")) {
					setTimeout(() => {
						window.location.href = "/auth/login?reason=token_expired";
					}, 100);
				}
			}
		}
		return Promise.reject(error);
	},
);

export default apiClient;
