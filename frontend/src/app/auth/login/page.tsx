"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/api/services";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";

function LoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const reason = searchParams.get("reason");
	const setUser = useAuthStore((state) => state.setUser);
	const setToken = useAuthStore((state) => state.setToken);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({ username: "", password: "" });

	useEffect(() => {
		if (reason === "token_expired") {
			setError("Token Anda telah kadaluarsa. Silakan login kembali.");
		}
	}, [reason]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await authService.login(formData);
			console.log("🔑 Login response:", response);

			if (!response.access_token || !response.user) {
				setError("Respons login tidak valid");
				setLoading(false);
				return;
			}

			// Cast user data to proper type
			const userData = {
				...response.user,
				role: response.user.role as "siswa" | "guru" | "admin",
			};

			setUser(userData);
			setToken(response.access_token);

			// Route berdasarkan role
			const roleRoute: Record<string, string> = {
				siswa: "/siswa/dashboard",
				guru: "/guru/dashboard",
				admin: "/admin/dashboard",
			};

			router.push(roleRoute[userData.role as string] || "/siswa/dashboard");
		} catch (err: any) {
			console.error("❌ Login error:", err);
			setError(err.response?.data?.message || "Login gagal");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-blue-600">
						LMS Sanggar Belajar
					</h1>
					<p className="text-gray-600 mt-2">Belajar Tanpa Batas</p>
				</div>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Username
						</label>
						<input
							type="text"
							name="username"
							value={formData.username}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Masukkan username"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Masukkan password"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
					>
						{loading ? "Sedang login..." : "Login"}
					</button>
				</form>

				<div className="mt-4 text-center">
					<p className="text-sm text-gray-500">
						Hubungi administrator untuk membuat akun
					</p>
				</div>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					Loading...
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	);
}
