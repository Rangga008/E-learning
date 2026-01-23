"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";

interface LayoutProps {
	children: React.ReactNode;
}

export default function TeacherLayout({ children }: LayoutProps) {
	const router = useRouter();
	const { user, setUser, setToken, isLoading } = useAuthStore();

	useEffect(() => {
		if (!isLoading && (!user || user.role !== "guru")) {
			router.push("/auth/login");
		}
	}, [user, router, isLoading]);

	const handleLogout = () => {
		setUser(null);
		setToken(null);
		router.push("/auth/login");
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-100">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
					<p className="mt-2 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<div className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white shadow-lg hidden md:flex flex-col">
				<div className="p-6 border-b border-purple-600">
					<h1 className="text-2xl font-bold">🎓 E-Learning</h1>
					<p className="text-purple-200 text-sm mt-1">Guru Dashboard</p>
				</div>

				<nav className="flex-1 p-4 space-y-2">
					<Link
						href="/teacher/dashboard"
						className="block px-4 py-3 rounded-lg hover:bg-purple-600 transition font-semibold"
					>
						📊 Dashboard
					</Link>
					<Link
						href="/teacher/classes"
						className="block px-4 py-3 rounded-lg hover:bg-purple-600 transition font-semibold"
					>
						👥 Kelas Saya
					</Link>
					<Link
						href="/teacher/corrections"
						className="block px-4 py-3 rounded-lg hover:bg-purple-600 transition font-semibold"
					>
						📝 Koreksi Tugas
					</Link>
					<Link
						href="/teacher/materials"
						className="block px-4 py-3 rounded-lg hover:bg-purple-600 transition font-semibold"
					>
						📚 Materi & Soal
					</Link>
					<Link
						href="/teacher/reports"
						className="block px-4 py-3 rounded-lg hover:bg-purple-600 transition font-semibold"
					>
						📈 Laporan Nilai
					</Link>
				</nav>

				<div className="p-4 border-t border-purple-600">
					<div className="bg-purple-600 bg-opacity-50 rounded-lg p-4 mb-4">
						<p className="text-sm text-purple-100">Login sebagai:</p>
						<p className="font-semibold">{user?.fullName}</p>
						<p className="text-xs text-purple-200">{user?.email}</p>
					</div>
					<button
						onClick={handleLogout}
						className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
					>
						🚪 Logout
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top Bar */}
				<div className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
					<h1 className="text-xl font-bold text-gray-800">🎓 E-Learning</h1>
					<button className="text-gray-600">☰</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-auto">{children}</div>
			</div>
		</div>
	);
}
