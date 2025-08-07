/* eslint-disable unicorn/switch-case-braces */
"use client";

import { toast } from "react-hot-toast";

interface ToastProps {
	message: string;
	type?: "success" | "error" | "loading" | "custom";
}

export const showToast = ({ message, type = "success" }: ToastProps) => {
	switch (type) {
		case "success":
			toast.success(message);
			break;
		case "error":
			toast.error(message);
			break;
		case "loading":
			toast.loading(message);
			break;
		default:
			toast(message);
	}
};
