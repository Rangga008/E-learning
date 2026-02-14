"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface ProtectedLayoutProps {
	children: ReactNode;
	allowedRoles: string[];
	fallbackUrl?: string;
}

export function ProtectedLayout({
	children,
	allowedRoles,
	fallbackUrl = "/auth/login",
}: ProtectedLayoutProps) {
	const router = useRouter();
	const { user, isLoading, isAuthenticated, openReLoginModal } = useAuthStore();

	useEffect(() => {
		if (isLoading) return;

		// Not authenticated
		if (!isAuthenticated || !user) {
			router.push("/auth/login");
			return;
		}

		// Not authorized (wrong role)
		if (!allowedRoles.includes(user.role)) {
			openReLoginModal("unauthorized");
			setTimeout(() => {
				router.push("/unauthorized");
			}, 500);
			return;
		}
	}, [
		user,
		isLoading,
		isAuthenticated,
		router,
		allowedRoles,
		openReLoginModal,
	]);

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

	// User not authenticated or not authorized
	if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
		return null;
	}

	return <>{children}</>;
}

/**
 * Higher-order component untuk wrap layout components
 * Usage: withProtectedLayout(Component, ["admin", "guru"])
 */
export function withProtectedLayout(
	Component: React.ComponentType<{ children: ReactNode }>,
	allowedRoles: string[],
) {
	return function ProtectedLayoutWrapper({
		children,
	}: {
		children: ReactNode;
	}) {
		return (
			<ProtectedLayout allowedRoles={allowedRoles}>
				<Component>{children}</Component>
			</ProtectedLayout>
		);
	};
}
