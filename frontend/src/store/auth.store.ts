"use client";

import { create } from "zustand";
import { User } from "@/types/index";

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setUser: (user: User | null) => void;
	setToken: (token: string | null) => void;
	logout: () => void;
	clearSession: () => void;
	restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: true,
	setUser: (user) => {
		set({ user, isAuthenticated: !!user });
		if (typeof window !== "undefined") {
			if (user) {
				localStorage.setItem("user", JSON.stringify(user));
			} else {
				localStorage.removeItem("user");
			}
		}
	},
	setToken: (token) => {
		set({ token });
		if (typeof window !== "undefined") {
			if (token) {
				localStorage.setItem("token", token);
			} else {
				localStorage.removeItem("token");
			}
		}
	},
	logout: () => {
		set({ user: null, token: null, isAuthenticated: false });
		if (typeof window !== "undefined") {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
	},
	clearSession: () => {
		set({ user: null, token: null, isAuthenticated: false, isLoading: false });
		if (typeof window !== "undefined") {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
	},
	restoreSession: () => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("token");
			const user = localStorage.getItem("user");
			if (token && user) {
				set({
					token,
					user: JSON.parse(user),
					isAuthenticated: true,
					isLoading: false,
				});
			} else {
				set({ isLoading: false });
			}
		}
	},
}));
