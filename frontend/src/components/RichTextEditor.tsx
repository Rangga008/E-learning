"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Load CSS - using require for better compatibility
if (typeof window !== "undefined") {
	try {
		require("react-quill/dist/quill.snow.css");
	} catch (e) {
		// CSS already loaded or not available
	}
}

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), {
	ssr: false,
	loading: () => (
		<div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-600 h-[400px] flex items-center justify-center">
			Loading editor...
		</div>
	),
});

interface RichTextEditorProps {
	value: string;
	onChange: (content: string) => void;
	onImageUpload: (file: File) => Promise<string>;
	placeholder?: string;
	disabled?: boolean;
	isUploading?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
	value,
	onChange,
	onImageUpload,
	placeholder = "Masukkan konten...",
	disabled = false,
	isUploading = false,
}) => {
	const [editorKey, setEditorKey] = useState(0);

	// Force re-render when value changes (especially when modal opens with existing content)
	useEffect(() => {
		if (value) {
			setEditorKey((prev) => prev + 1);
		}
	}, [value]);

	const insertImage = useCallback(
		async (file: File) => {
			try {
				// Validate file type
				const allowedTypes = [
					"image/jpeg",
					"image/png",
					"image/jpg",
					"image/gif",
					"image/webp",
				];
				if (!allowedTypes.includes(file.type)) {
					alert("Hanya file gambar (JPG, PNG, GIF, WebP) yang diizinkan");
					return;
				}

				// Validate file size (max 5MB)
				if (file.size > 5 * 1024 * 1024) {
					alert("Ukuran gambar tidak boleh lebih dari 5 MB");
					return;
				}

				const imageUrl = await onImageUpload(file);

				// Insert image into content using HTML
				// Append image to current content
				const imageHtml = `<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`;
				const newContent = value + `<p>${imageHtml}</p>`;
				onChange(newContent);
			} catch (error: any) {
				console.error("Error uploading image:", error);
				alert(error.message || "Gagal upload gambar");
			}
		},
		[onImageUpload, value, onChange],
	);

	const handleImageClick = useCallback(() => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/jpeg,image/png,image/jpg,image/gif,image/webp";
		input.onchange = async (e: any) => {
			const file = e.target.files?.[0];
			if (file) {
				await insertImage(file);
			}
		};
		input.click();
	}, [insertImage]);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file.type.startsWith("image/")) {
					insertImage(file);
				}
			}
		}
	};

	const modules = React.useMemo(
		() => ({
			toolbar: {
				container: [
					[{ header: [1, 2, 3, 4, 5, 6, false] }],
					["bold", "italic", "underline", "strike"],
					[{ color: [] }, { background: [] }],
					[{ list: "ordered" }, { list: "bullet" }],
					["blockquote", "code-block"],
					["link", "image"],
					[{ align: [] }],
					["clean"],
				],
				handlers: {
					image: handleImageClick,
				},
			},
			clipboard: {
				matchVisual: false,
			},
		}),
		[handleImageClick],
	);

	return (
		<div
			className="border border-gray-300 rounded-lg overflow-hidden"
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div suppressHydrationWarning>
				<ReactQuill
					key={editorKey}
					theme="snow"
					value={value}
					onChange={onChange}
					modules={modules}
					placeholder={placeholder}
					readOnly={disabled || isUploading}
					style={{
						height: "400px",
						backgroundColor: disabled || isUploading ? "#f5f5f5" : "white",
					}}
				/>
			</div>
			{isUploading && (
				<div className="bg-blue-50 border-t border-blue-200 p-2 text-sm text-blue-700">
					📤 Uploading image...
				</div>
			)}
		</div>
	);
};
