"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import axios from "axios";

function CreateUserContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user, token } = useAuthStore();
	const [role, setRole] = useState<string>(searchParams.get("role") || "siswa");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		fullName: "",
		password: "",
		confirmPassword: "",
		role: role,
	});

	useEffect(() => {
		if (!user || user.role !== "admin") {
			router.push("/auth/login");
			return;
		}
	}, [user, router]);

	useEffect(() => {
		setFormData((prev) => ({ ...prev, role }));
	}, [role]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Validation
		if (
			!formData.username ||
			!formData.email ||
			!formData.fullName ||
			!formData.password
		) {
			setError("Semua field harus diisi");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Password tidak cocok");
			return;
		}

		if (formData.password.length < 6) {
			setError("Password minimal 6 karakter");
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/create`,
				{
					username: formData.username,
					email: formData.email,
					fullName: formData.fullName,
					password: formData.password,
					role: formData.role,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			setSuccess(`${response.data.data.fullName} berhasil dibuat!`);
			setFormData({
				username: "",
				email: "",
				fullName: "",
				password: "",
				confirmPassword: "",
				role,
			});

			// Redirect setelah 2 detik
			setTimeout(() => {
				if (role === "siswa") {
					router.push("/admin/siswa");
				} else if (role === "guru") {
					router.push("/admin/guru");
				} else {
					router.push("/admin/dashboard");
				}
			}, 2000);
		} catch (err: any) {
			setError(err.response?.data?.message || "Gagal membuat user");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/admin/dashboard"
						className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-flex items-center gap-2 transition"
					>
						<span>←</span> Kembali
					</Link>
					<div className="flex items-center gap-3">
						<div className="text-4xl">➕</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Buat User Baru
							</h1>
							<p className="text-gray-600 text-sm mt-1">
								Tambahkan user baru ke sistem dengan data lengkap
							</p>
						</div>
					</div>
				</div>

				{/* Form */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* Form Header */}
					<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
						<h2 className="text-lg font-semibold flex items-center gap-2">
							<span className="text-2xl">📝</span> Informasi User
						</h2>
					</div>

					<div className="p-8">
						{error && (
							<div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-4 rounded-lg mb-6 flex items-start gap-3">
								<span className="text-2xl">⚠️</span>
								<div>
									<p className="font-semibold">Error</p>
									<p className="text-sm mt-1">{error}</p>
								</div>
							</div>
						)}

						{success && (
							<div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-4 rounded-lg mb-6 flex items-start gap-3">
								<span className="text-2xl">✅</span>
								<div>
									<p className="font-semibold">Sukses</p>
									<p className="text-sm mt-1">{success}</p>
									<p className="text-xs text-green-600 mt-2">
										Anda akan diarahkan dalam beberapa detik...
									</p>
								</div>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Role Selection - Large Card */}
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
								<label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
									<span className="text-lg">👤</span> Tipe User
								</label>
								<div className="grid grid-cols-3 gap-3">
									{[
										{ value: "siswa", label: "👨‍🎓 Siswa" },
										{ value: "guru", label: "👨‍🏫 Guru" },
										{ value: "admin", label: "👨‍💼 Admin" },
									].map((option) => (
										<label
											key={option.value}
											className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
												role === option.value
													? "border-blue-600 bg-blue-100"
													: "border-gray-200 bg-white hover:border-blue-300"
											}`}
										>
											<input
												type="radio"
												name="role"
												value={option.value}
												checked={role === option.value}
												onChange={(e) => setRole(e.target.value)}
												className="w-4 h-4 text-blue-600 cursor-pointer"
											/>
											<span className="font-semibold text-gray-700">
												{option.label}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Form Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Username */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Username <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="username"
										value={formData.username}
										onChange={handleChange}
										placeholder="Masukkan username"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
										required
									/>
									<p className="text-gray-500 text-xs mt-1">
										Gunakan huruf, angka, dan underscore
									</p>
								</div>

								{/* Email */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Email <span className="text-red-500">*</span>
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										placeholder="nama@email.com"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
										required
									/>
									<p className="text-gray-500 text-xs mt-1">
										Email harus valid dan unik
									</p>
								</div>
							</div>

							{/* Full Name - Full Width */}
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Nama Lengkap <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
									placeholder="Masukkan nama lengkap"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
									required
								/>
							</div>

							{/* Password Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Password */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Password <span className="text-red-500">*</span>
									</label>
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="Masukkan password"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
										required
									/>
									<p className="text-gray-500 text-xs mt-1">
										Minimal 6 karakter
									</p>
								</div>

								{/* Confirm Password */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Konfirmasi Password <span className="text-red-500">*</span>
									</label>
									<input
										type="password"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Ulangi password"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
										required
									/>
									<p className="text-gray-500 text-xs mt-1">
										Harus sama dengan password di atas
									</p>
								</div>
							</div>

							{/* Info Box */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<p className="text-sm text-blue-900 flex items-start gap-2">
									<span className="text-lg">ℹ️</span>
									<span>
										User akan dapat login dengan username dan password yang
										telah dibuat. Pastikan password kuat dan mudah diingat.
									</span>
								</p>
							</div>

							{/* Submit Buttons */}
							<div className="flex gap-3 pt-6 border-t border-gray-200">
								<Link
									href="/admin/dashboard"
									className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition text-center"
								>
									Batal
								</Link>
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-2"
								>
									{loading && (
										<div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									)}
									{loading ? "Menyimpan..." : "✅ Buat User"}
								</button>
							</div>
						</form>
					</div>
				</div>

				{/* Info Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
					<div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
						<h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
							<span>✅</span> Username
						</h3>
						<p className="text-gray-600 text-sm">Harus unik di sistem</p>
					</div>
					<div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
						<h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
							<span>🔒</span> Password
						</h3>
						<p className="text-gray-600 text-sm">Minimal 6 karakter</p>
					</div>
					<div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
						<h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
							<span>📧</span> Email
						</h3>
						<p className="text-gray-600 text-sm">Format valid diperlukan</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CreateUserPage() {
	return (
		<Suspense fallback={<div className="p-4">Loading...</div>}>
			<CreateUserContent />
		</Suspense>
	);
}
