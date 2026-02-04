"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function Home() {
	const router = useRouter();
	const { user } = useAuthStore();

	useEffect(() => {
		// Jika user sudah login, redirect ke dashboard sesuai role
		if (user) {
			const roleRoute: Record<string, string> = {
				siswa: "/siswa/dashboard",
				guru: "/guru/dashboard",
				admin: "/admin/dashboard",
			};
			router.push(roleRoute[user.role as string] || "/siswa/dashboard");
		}
	}, [user, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
			<div className="text-center text-white">
				<div className="mb-6">
					<div className="text-6xl mb-4">📚</div>
					<h1 className="text-5xl font-bold mb-4">LMS Sanggar Belajar</h1>
					<p className="text-2xl mb-2">Belajar Tanpa Batas</p>
					<p className="text-gray-100 text-lg">
						Platform Pembelajaran Terpadu untuk Semua
					</p>
				</div>

				<div className="space-x-4 mt-8">
					<a
						href="/auth/login"
						className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition inline-block shadow-lg"
					>
						🚀 Login Sekarang
					</a>
					<a
						href="/auth/register"
						className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition inline-block"
					>
						📝 Daftar
					</a>
				</div>

				<div className="mt-12 text-sm text-gray-200">
					<p>Hubungi administrator untuk membuat akun baru</p>
				</div>
			</div>
		</div>
	);
}
