"use client";

import { ReactNode, useEffect } from "react";
import "./globals.css";
import { useAuthStore } from "@/store/auth.store";

export default function RootLayout({ children }: { children: ReactNode }) {
	const restoreSession = useAuthStore((state) => state.restoreSession);

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
			<body className="bg-gray-50">{children}</body>
		</html>
	);
}
