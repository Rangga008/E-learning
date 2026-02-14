"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Plain axios instance for login/auth requests without modal interceptor
// This prevents infinite loops when re-login modal itself tries to login
export const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add token to auth requests
apiClient.interceptors.request.use((config) => {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// No response interceptor here - let the server response pass through
// The ReLoginModal will handle its own error scenarios

export default apiClient;
