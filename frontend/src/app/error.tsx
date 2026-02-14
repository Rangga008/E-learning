"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		// Log error to monitoring service
		console.error("Application Error:", error);
	}, [error]);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
			<div className="text-center max-w-md">
				<div className="mb-8">
					<div className="text-6xl">⚠️</div>
					<h1 className="text-5xl font-bold text-red-600 mt-4">500</h1>
				</div>

				<h2 className="text-3xl font-bold text-gray-800 mb-3">
					Terjadi Kesalahan
				</h2>

				<p className="text-gray-600 text-lg mb-8">
					Maaf, terjadi kesalahan pada server. Tim kami sudah diberitahu dan
					sedang menangani masalah ini.
				</p>

				{showDetails && (
					<div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 text-left">
						<p className="text-xs text-gray-700 font-mono break-words">
							{error.message}
						</p>
						{error.digest && (
							<p className="text-xs text-gray-500 mt-2">ID: {error.digest}</p>
						)}
					</div>
				)}

				<div className="space-y-3 mb-6">
					<button
						onClick={reset}
						className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
					>
						🔄 Coba Lagi
					</button>

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

				<button
					onClick={() => setShowDetails(!showDetails)}
					className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
				>
					{showDetails ? "Sembunyikan" : "Tampilkan"} Detail Error
				</button>

				<p className="text-gray-500 text-sm mt-8">
					Jika masalah berlanjut, silakan hubungi administrator.
				</p>
			</div>
		</div>
	);
}
