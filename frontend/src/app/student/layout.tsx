"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";

interface LayoutProps {
	children: React.ReactNode;
}

export default function StudentLayout({ children }: LayoutProps) {
	const router = useRouter();
	const { user, setUser, setToken, isLoading } = useAuthStore();

	useEffect(() => {
		if (!isLoading && (!user || user.role !== "siswa")) {
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
			<div className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-lg hidden md:flex flex-col">
				<div className="p-6 border-b border-blue-600">
					<h1 className="text-2xl font-bold">📚 E-Learning</h1>
					<p className="text-blue-200 text-sm mt-1">Platform Belajar</p>
				</div>

				<nav className="flex-1 p-4 space-y-2">
					<Link
						href="/student/dashboard"
						className="block px-4 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
					>
						📊 Dashboard
					</Link>
					<Link
						href="/student/courses"
						className="block px-4 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
					>
						📚 Kursus Saya
					</Link>
					<Link
						href="/student/leaderboard"
						className="block px-4 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
					>
						🏆 Leaderboard
					</Link>
					<Link
						href="/student/missions"
						className="block px-4 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
					>
						🎯 Misi Harian
					</Link>
				</nav>

				<div className="p-4 border-t border-blue-600">
					<div className="bg-blue-600 bg-opacity-50 rounded-lg p-4 mb-4">
						<p className="text-sm text-blue-100">Login sebagai:</p>
						<p className="font-semibold">{user?.fullName}</p>
						<p className="text-xs text-blue-200">{user?.email}</p>
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
					<h1 className="text-xl font-bold text-gray-800">📚 E-Learning</h1>
					<button className="text-gray-600">☰</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-auto">{children}</div>
			</div>
		</div>
	);
}
