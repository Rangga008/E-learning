"use client";

import Link from "next/link";

export default function Forbidden() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
			<div className="text-center max-w-md">
				<div className="mb-8">
					<h1 className="text-9xl font-bold text-purple-600">403</h1>
				</div>

				<h2 className="text-3xl font-bold text-gray-800 mb-3">Akses Ditolak</h2>

				<p className="text-gray-600 text-lg mb-8">
					Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login
					dengan akun yang sesuai atau hubungi administrator.
				</p>

				<div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-6">
					<p className="text-sm text-purple-800">
						<strong>💡 Tips:</strong> Pastikan Anda sudah login dengan akun yang
						memiliki akses ke halaman ini.
					</p>
				</div>

				<div className="space-y-3">
					<Link
						href="/auth/login"
						className="inline-block w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
					>
						🔐 Login dengan Akun Lain
					</Link>

					<Link
						href="/"
						className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
					>
						🏠 Ke Halaman Utama
					</Link>

					<button
						onClick={() => window.history.back()}
						className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
					>
						⬅️ Kembali Ke Halaman Sebelumnya
					</button>
				</div>

				<p className="text-gray-500 text-sm mt-8">
					Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator
					kami.
				</p>
			</div>
		</div>
	);
}
