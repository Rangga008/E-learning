"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function GuruLayout({
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
			<div className="fixed left-0 top-0 w-64 h-screen bg-green-600 text-white p-6 overflow-y-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-bold flex items-center gap-2">
						👨‍🏫 Guru
					</h1>
					<p className="text-green-100 text-sm mt-1">Portal Pengajar</p>
				</div>

				<nav className="space-y-2">
					<Link
						href="/guru/dashboard"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/guru/dashboard")
								? "bg-green-700"
								: "hover:bg-green-700"
						}`}
					>
						📊 Dashboard
					</Link>

					<Link
						href="/guru/elearning"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/guru/elearning") ||
							pathname.startsWith("/guru/elearning/")
								? "bg-green-700"
								: "hover:bg-green-700"
						}`}
					>
						📚 E-Learning
					</Link>

					<Link
						href="/guru/koreksi-nilai"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/guru/koreksi-nilai")
								? "bg-green-700"
								: "hover:bg-green-700"
						}`}
					>
						✏️ Koreksi Nilai
					</Link>

					<Link
						href="/guru/bank-soal"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/guru/bank-soal")
								? "bg-green-700"
								: "hover:bg-green-700"
						}`}
					>
						🏦 Bank Soal
					</Link>

					<Link
						href="/guru/laporan"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/guru/laporan") ? "bg-green-700" : "hover:bg-green-700"
						}`}
					>
						📊 Laporan
					</Link>

					<Link
						href="/guru/jurnal-kelas"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/guru/jurnal-kelas")
								? "bg-green-700"
								: "hover:bg-green-700"
						}`}
					>
						📔 Jurnal Kelas
					</Link>

					<Link
						href="/guru/pelaporan"
						className={`block px-4 py-3 rounded-lg transition-colors ${
							isActive("/guru/pelaporan")
								? "bg-green-700"
								: "hover:bg-green-700"
						}`}
					>
						📊 Pelaporan Lama
					</Link>
				</nav>

				{/* USER INFO & LOGOUT */}
				<div className="absolute bottom-6 left-6 right-6">
					<div className="bg-green-700 rounded-lg p-4 mb-4">
						<p className="text-sm font-medium">Login sebagai:</p>
						<p className="text-sm text-green-100">{user?.fullName}</p>
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
