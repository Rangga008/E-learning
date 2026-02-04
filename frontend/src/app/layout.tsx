"use client";

import { ReactNode, useEffect } from "react";
import "./globals.css";
import { useAuthStore } from "@/store/auth.store";

export default function RootLayout({ children }: { children: ReactNode }) {
	const restoreSession = useAuthStore((state) => state.restoreSession);
	const clearSession = useAuthStore((state) => state.clearSession);

	useEffect(() => {
		restoreSession();

		// Listen for token expiry events from apiClient interceptor
		const handleAuthExpired = () => {
			console.warn("Token expired, clearing session and redirecting...");
			clearSession();
			// Ensure redirect happens
			if (
				typeof window !== "undefined" &&
				!window.location.pathname.startsWith("/auth/login")
			) {
				setTimeout(() => {
					window.location.href = "/auth/login?reason=token_expired";
				}, 50);
			}
		};

		window.addEventListener("auth-expired", handleAuthExpired);
		return () => {
			window.removeEventListener("auth-expired", handleAuthExpired);
		};
	}, [restoreSession, clearSession]);

	return (
		<html lang="id">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>LMS Sanggar Belajar - Belajar Tanpa Batas</title>
			</head>
			<body className="bg-gray-50">{children}</body>
		</html>
	);
}
