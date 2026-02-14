"use client";

import { ReactNode, useEffect } from "react";
import "./globals.css";
import { useAuthStore } from "@/store/auth.store";
import { ReLoginModal } from "@/components/ReLoginModal";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function RootLayout({ children }: { children: ReactNode }) {
	const restoreSession = useAuthStore((state) => state.restoreSession);
	const showReLoginModal = useAuthStore((state) => state.showReLoginModal);
	const reLoginReason = useAuthStore((state) => state.reLoginReason);
	const closeReLoginModal = useAuthStore((state) => state.closeReLoginModal);

	// Track session timeout and auto-logout
	useSessionTimeout();

	useEffect(() => {
		restoreSession();
	}, [restoreSession]);

	return (
		<html lang="id">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>LMS Sanggar Belajar - Belajar Tanpa Batas</title>
			</head>
			<body className="bg-gray-50">
				{children}
				<ReLoginModal
					isOpen={showReLoginModal}
					reason={reLoginReason}
					onClose={closeReLoginModal}
				/>
			</body>
		</html>
	);
}
