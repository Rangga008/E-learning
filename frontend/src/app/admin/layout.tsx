"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { AdminSidebar } from "./components/sidebar";

interface LayoutProps {
	children: React.ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
	const router = useRouter();
	const { user, isLoading } = useAuthStore();

	// Track session timeout
	useSessionTimeout();

	useEffect(() => {
		if (!isLoading && (!user || user.role !== "admin")) {
			router.push("/unauthorized");
		}
	}, [user, router, isLoading]);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-100">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
					<p className="mt-2 text-gray-600">Memverifikasi akses...</p>
				</div>
			</div>
		);
	}

	if (!user || user.role !== "admin") {
		return null;
	}

	return (
		<div className="flex h-screen bg-gray-100">
			<div className="hidden md:block md:w-64 flex-shrink-0">
				<AdminSidebar />
			</div>
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	);
}
