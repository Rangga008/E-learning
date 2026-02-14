"use client";

import axios, { AxiosInstance, AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Track if we're already handling token expiry to avoid duplicate calls
let isHandlingTokenExpiry = false;

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		const isUnauthorized = error.response?.status === 401;
		const isForbidden = error.response?.status === 403;
		const errorMessage = (error.response?.data as any)?.message || "";

		if ((isUnauthorized || isForbidden) && typeof window !== "undefined") {
			// Prevent multiple modal opens
			if (isHandlingTokenExpiry) {
				console.log("Already handling token expiry, rejecting...");
				return Promise.reject(error);
			}

			isHandlingTokenExpiry = true;
			console.log(
				`[Auth Error] ${
					isUnauthorized ? "401 Unauthorized" : "403 Forbidden"
				}: ${errorMessage}`,
			);

			try {
				const authStore = useAuthStore.getState();

				// Clear session immediately
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				authStore.clearSession();

				if (isUnauthorized) {
					// Token expired or invalid - show re-login modal
					console.log("Token invalid, opening re-login modal...");
					authStore.openReLoginModal("token_invalid");
				} else if (isForbidden) {
					// Forbidden access
					console.log("Access forbidden, opening unauthorized modal...");
					authStore.openReLoginModal("unauthorized");
				}
			} catch (err) {
				console.error("Error handling auth error:", err);
				// Fallback: redirect to login
				if (typeof window !== "undefined") {
					setTimeout(() => {
						window.location.href = "/auth/login";
					}, 500);
				}
			} finally {
				// Reset flag after a short delay to allow next error to be processed
				setTimeout(() => {
					isHandlingTokenExpiry = false;
				}, 1000);
			}
		}

		return Promise.reject(error);
	},
);

export default axiosInstance;
