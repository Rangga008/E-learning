"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PengaturanPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to general settings by default
		router.push("/admin/pengaturan/umum");
	}, [router]);

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="text-center">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600"></div>
				<p className="mt-2 text-gray-600">Loading...</p>
			</div>
		</div>
	);
}
