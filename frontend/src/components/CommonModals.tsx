"use client";

import React from "react";

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isDangerous?: boolean;
	isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	title,
	message,
	confirmText = "Konfirmasi",
	cancelText = "Batal",
	onConfirm,
	onCancel,
	isDangerous = false,
	isLoading = false,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
				<div className="flex items-center gap-3 mb-4">
					{isDangerous ? (
						<div className="text-3xl">⚠️</div>
					) : (
						<div className="text-3xl">❓</div>
					)}
					<h2 className="text-xl font-bold text-gray-900">{title}</h2>
				</div>

				<p className="text-gray-700 mb-6">{message}</p>

				<div className="flex gap-3">
					<button
						onClick={onCancel}
						disabled={isLoading}
						className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
							isDangerous
								? "bg-red-600 hover:bg-red-700"
								: "bg-blue-600 hover:bg-blue-700"
						}`}
					>
						{isLoading ? "⏳ Memproses..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

interface SuccessToastProps {
	isOpen: boolean;
	message: string;
	title?: string;
	duration?: number;
	onClose?: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
	isOpen,
	message,
	title = "Berhasil",
	duration = 3000,
	onClose,
}) => {
	React.useEffect(() => {
		if (!isOpen || !onClose) return;

		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [isOpen, duration, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
			<div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
				<div className="flex items-start gap-3">
					<div className="text-2xl">✅</div>
					<div>
						<h3 className="font-semibold text-green-900">{title}</h3>
						<p className="text-sm text-green-700 mt-1">{message}</p>
					</div>
					<button
						onClick={onClose}
						className="text-green-600 hover:text-green-900 font-bold"
					>
						×
					</button>
				</div>
			</div>
		</div>
	);
};

interface ErrorToastProps {
	isOpen: boolean;
	message: string;
	title?: string;
	duration?: number;
	onClose?: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
	isOpen,
	message,
	title = "Gagal",
	duration = 5000,
	onClose,
}) => {
	React.useEffect(() => {
		if (!isOpen || !onClose) return;

		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [isOpen, duration, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
			<div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
				<div className="flex items-start gap-3">
					<div className="text-2xl">❌</div>
					<div>
						<h3 className="font-semibold text-red-900">{title}</h3>
						<p className="text-sm text-red-700 mt-1">{message}</p>
					</div>
					<button
						onClick={onClose}
						className="text-red-600 hover:text-red-900 font-bold"
					>
						×
					</button>
				</div>
			</div>
		</div>
	);
};

interface InfoToastProps {
	isOpen: boolean;
	message: string;
	title?: string;
	duration?: number;
	onClose?: () => void;
}

export const InfoToast: React.FC<InfoToastProps> = ({
	isOpen,
	message,
	title = "Informasi",
	duration = 4000,
	onClose,
}) => {
	React.useEffect(() => {
		if (!isOpen || !onClose) return;

		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [isOpen, duration, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
			<div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
				<div className="flex items-start gap-3">
					<div className="text-2xl">ℹ️</div>
					<div>
						<h3 className="font-semibold text-blue-900">{title}</h3>
						<p className="text-sm text-blue-700 mt-1">{message}</p>
					</div>
					<button
						onClick={onClose}
						className="text-blue-600 hover:text-blue-900 font-bold"
					>
						×
					</button>
				</div>
			</div>
		</div>
	);
};
