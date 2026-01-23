"use client";

import React, { ReactNode } from "react";

interface FormField {
	name: string;
	label: string;
	type: "text" | "email" | "password" | "select" | "textarea";
	placeholder?: string;
	required?: boolean;
	options?: { value: string | number; label: string }[];
	value: string | number;
	onChange: (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => void;
	error?: string;
	disabled?: boolean;
}

interface FormModalProps {
	isOpen: boolean;
	title: string;
	fields: FormField[];
	onSubmit: () => void;
	onCancel: () => void;
	submitLabel?: string;
	cancelLabel?: string;
	isLoading?: boolean;
	children?: ReactNode;
	maxWidth?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
	isOpen,
	title,
	fields,
	onSubmit,
	onCancel,
	submitLabel = "Simpan",
	cancelLabel = "Batal",
	isLoading = false,
	children,
	maxWidth = "max-w-md",
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
			<div
				className={`bg-white rounded-xl shadow-2xl p-8 w-full ${maxWidth} my-auto`}
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">{title}</h2>
					<button
						onClick={onCancel}
						disabled={isLoading}
						className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
					>
						×
					</button>
				</div>

				<div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
					{fields.map((field) => (
						<div key={field.name}>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								{field.label}
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</label>

							{field.type === "select" ? (
								<select
									name={field.name}
									value={field.value}
									onChange={field.onChange}
									disabled={isLoading || field.disabled}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
								>
									<option value="">-- {field.placeholder || "Pilih"} --</option>
									{field.options?.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							) : field.type === "textarea" ? (
								<textarea
									name={field.name}
									value={field.value}
									onChange={field.onChange}
									placeholder={field.placeholder}
									disabled={isLoading || field.disabled}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
									rows={4}
								/>
							) : (
								<input
									type={field.type}
									name={field.name}
									value={field.value}
									onChange={field.onChange}
									placeholder={field.placeholder}
									disabled={isLoading || field.disabled}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
								/>
							)}

							{field.error && (
								<p className="text-red-500 text-xs mt-1">{field.error}</p>
							)}
						</div>
					))}
					{children}
				</div>

				<div className="flex gap-3">
					<button
						onClick={onCancel}
						disabled={isLoading}
						className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
					>
						{cancelLabel}
					</button>
					<button
						onClick={onSubmit}
						disabled={isLoading}
						className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
					>
						{isLoading && (
							<div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						)}
						{submitLabel}
					</button>
				</div>
			</div>
		</div>
	);
};
