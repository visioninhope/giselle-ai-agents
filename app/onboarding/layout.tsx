import type { ReactNode } from "react";

export default function OnboardingLayout({
	children,
}: { children: ReactNode }) {
	return (
		<div className="h-screen w-screen flex items-center justify-center">
			{children}
		</div>
	);
}
