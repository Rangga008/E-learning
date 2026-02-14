"use client";

import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
			<div className="text-center max-w-md">
				<div className="mb-8">
					<h1 className="text-9xl font-bold text-orange-600 animate-bounce">
						404
					</h1>
				</div>

				<h2 className="text-3xl font-bold text-gray-800 mb-3">
					Halaman Tidak Ditemukan
				</h2>

				<p className="text-gray-600 text-lg mb-8">
					Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dihapus.
				</p>

				<div className="space-y-3">
					<Link
						href="/"
						className="inline-block w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
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
					Jika Anda terus mengalami masalah, silakan hubungi administrator.
				</p>
			</div>
		</div>
	);
}
