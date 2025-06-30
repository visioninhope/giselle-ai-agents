"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		// Check if the current path is a workspace URL
		// If so, redirect to login with returnUrl so the user can try again after authentication
		if (pathname?.includes("/workspaces/")) {
			const returnUrl = encodeURIComponent(pathname);
			router.push(`/login?returnUrl=${returnUrl}`);
		}
	}, [pathname, router]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
			<p className="text-gray-600 mb-8">
				The page you are looking for does not exist.
			</p>
			<a href="/" className="text-blue-500 hover:underline">
				Go back to home
			</a>
		</div>
	);
}
