import { useState, useCallback } from "react";
import { logger } from "@/utils/logger";

interface Toast {
	isOpen: boolean;
	message: string;
}

interface ConfirmOptions {
	title: string;
	message: string;
	onConfirm: () => void | Promise<void>;
}

/**
 * Custom hook for managing notifications (toasts and confirmations)
 * Provides a centralized way to show success, error, and confirm dialogs
 * Usage:
 *   const { showSuccess, showError, showConfirm, SuccessToast, ErrorToast, ConfirmModal } = useNotification();
 */
export const useNotification = () => {
	const [successToast, setSuccessToast] = useState<Toast>({
		isOpen: false,
		message: "",
	});
	const [errorToast, setErrorToast] = useState<Toast>({
		isOpen: false,
		message: "",
	});
	const [confirmModal, setConfirmModal] = useState({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

	/**
	 * Show success toast notification
	 * @param message - Success message to display
	 * @param details - Optional details for logging
	 */
	const showSuccess = useCallback((message: string, details?: any) => {
		logger.success("Operation Success", details);
		setSuccessToast({ isOpen: true, message });
	}, []);

	/**
	 * Show error toast notification
	 * @param message - Error message to display
	 * @param details - Optional details for logging
	 */
	const showError = useCallback((message: string, details?: any) => {
		logger.error("Operation Error", details);
		setErrorToast({ isOpen: true, message });
	}, []);

	/**
	 * Show confirmation modal dialog
	 * @param options - Configuration object with title, message, and onConfirm callback
	 */
	const showConfirm = useCallback((options: ConfirmOptions) => {
		setConfirmModal({
			isOpen: true,
			title: options.title,
			message: options.message,
			onConfirm: options.onConfirm,
		});
	}, []);

	/**
	 * Close success toast
	 */
	const closeSuccess = useCallback(() => {
		setSuccessToast({ isOpen: false, message: "" });
	}, []);

	/**
	 * Close error toast
	 */
	const closeError = useCallback(() => {
		setErrorToast({ isOpen: false, message: "" });
	}, []);

	/**
	 * Close confirmation modal
	 */
	const closeConfirm = useCallback(() => {
		setConfirmModal({ ...confirmModal, isOpen: false });
	}, [confirmModal]);

	return {
		// State
		successToast,
		errorToast,
		confirmModal,

		// Actions
		showSuccess,
		showError,
		showConfirm,
		closeSuccess,
		closeError,
		closeConfirm,

		// Setters for direct state control if needed
		setSuccessToast,
		setErrorToast,
		setConfirmModal,
	};
};
