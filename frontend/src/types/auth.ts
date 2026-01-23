"use client";

export interface LoginData {
	username: string;
	password: string;
}

export interface RegisterData {
	username: string;
	email: string;
	password: string;
	fullName: string;
	role: "siswa" | "guru" | "admin";
}
