"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function SiswaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = () => {
		logout();
		router.push("/auth/login");
	};

	const isActive = (path: string) => pathname === path;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* SIDEBAR */}
			<div className="fixed left-0 top-0 w-64 h-screen bg-blue-600 text-white p-6 overflow-y-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-bold flex items-center gap-2">
						📚 E-Learning
					</h1>
					<p className="text-blue-100 text-sm mt-1">Platform Belajar</p>
				</div>

				<nav className="space-y-2">
					<Link
						href="/siswa/dashboard"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/siswa/dashboard") ? "bg-blue-700" : "hover:bg-blue-700"
						}`}
					>
						📊 Dashboard
					</Link>

					<Link
						href="/siswa/elearning"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/siswa/elearning") ||
							pathname.startsWith("/siswa/elearning/")
								? "bg-blue-700"
								: "hover:bg-blue-700"
						}`}
					>
						📚 E-Learning
					</Link>

					<Link
						href="/siswa/berhitung"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/siswa/berhitung") ||
							pathname.startsWith("/siswa/berhitung/")
								? "bg-blue-700"
								: "hover:bg-blue-700"
						}`}
					>
						🧮 Berhitung
					</Link>

					<Link
						href="/siswa/nilai"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/siswa/nilai") ? "bg-blue-700" : "hover:bg-blue-700"
						}`}
					>
						📊 Nilai
					</Link>
				</nav>

				{/* USER INFO & LOGOUT */}
				<div className="absolute bottom-6 left-6 right-6">
					<div className="bg-blue-700 rounded-lg p-4 mb-4">
						<p className="text-sm font-medium">Login sebagai:</p>
						<p className="text-sm text-blue-100">{user?.fullName}</p>
					</div>
					<button
						onClick={handleLogout}
						className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
					>
						🚪 Logout
					</button>
				</div>
			</div>

			{/* MAIN CONTENT */}
			<div className="ml-64">{children}</div>
		</div>
	);
}
