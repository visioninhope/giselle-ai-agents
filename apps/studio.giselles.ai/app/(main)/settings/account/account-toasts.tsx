"use client";

import { Toast } from "@/packages/components/toast";
import { useToast } from "@/packages/contexts/toast";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function AccountToasts() {
	const searchParams = useSearchParams();
	const { toasts, addToast } = useToast();
	// Reference to track already processed errors to prevent duplicate handling
	const processedErrorRef = useRef<string | null>(null);

	useEffect(() => {
		// Get the authentication error from URL parameters
		const authError = searchParams?.get("authError");

		// Only process if there's an error and it's not already processed
		if (authError && processedErrorRef.current !== authError) {
			// Update reference to mark this error as processed
			processedErrorRef.current = authError;

			// Display toast notification with the error message
			addToast({
				title: "Authentication Failed",
				message: authError,
				type: "error",
				duration: 8000, // Display for 8 seconds
			});

			// Clean up URL parameters to avoid showing the same error on page refresh
			const newUrl = window.location.pathname;
			window.history.replaceState({}, "", newUrl);
		}
	}, [searchParams, addToast]); // Include addToast in dependencies to ensure effect runs when it changes

	// Render all active toast notifications
	return toasts.map((toast) => <Toast key={toast.id} {...toast} />);
}
