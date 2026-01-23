"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Register page disabled - Account creation is handled by admin only
 * Redirects to login page
 */
export default function RegisterPage() {
	const router = useRouter();

	useEffect(() => {
		router.push("/auth/login");
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="text-center">
				<p className="text-gray-600">Redirecting to login...</p>
			</div>
		</div>
	);
}
