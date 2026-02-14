import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes (1 min warning before logout)

export function useSessionTimeout() {
	const { isAuthenticated, openReLoginModal, updateLastActivityTime, logout } =
		useAuthStore();

	useEffect(() => {
		if (!isAuthenticated) return;

		let inactivityTimer: NodeJS.Timeout;
		let warningTimer: NodeJS.Timeout;

		const resetTimers = () => {
			// Clear existing timers
			if (inactivityTimer) clearTimeout(inactivityTimer);
			if (warningTimer) clearTimeout(warningTimer);

			// Update last activity time
			updateLastActivityTime();

			// Set warning timer (at 14 minutes)
			warningTimer = setTimeout(() => {
				// Show warning that session will expire in 1 minute
				openReLoginModal("session_expired");
			}, WARNING_TIMEOUT_MS);

			// Set logout timer (at 15 minutes)
			inactivityTimer = setTimeout(() => {
				logout();
				openReLoginModal("session_expired");
			}, SESSION_TIMEOUT_MS);
		};

		// Track user activity
		const activityEvents = [
			"mousedown",
			"keydown",
			"scroll",
			"touchstart",
			"click",
		];

		const handleActivity = () => {
			resetTimers();
		};

		// Add event listeners
		activityEvents.forEach((event) => {
			window.addEventListener(event, handleActivity);
		});

		// Initialize timers
		resetTimers();

		// Cleanup
		return () => {
			activityEvents.forEach((event) => {
				window.removeEventListener(event, handleActivity);
			});
			if (inactivityTimer) clearTimeout(inactivityTimer);
			if (warningTimer) clearTimeout(warningTimer);
		};
	}, [isAuthenticated, openReLoginModal, updateLastActivityTime, logout]);
}
