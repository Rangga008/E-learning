"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NumerasiSettingPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to the new location in Pengaturan section
		router.push("/admin/pengaturan/numerasi");
	}, [router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<p className="text-gray-500">Redirecting...</p>
		</div>
	);
}
