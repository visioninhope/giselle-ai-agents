import type React from "react";

interface UiPageProps {
	title: string;
	children: React.ReactNode;
}

export function UiPage({ title, children }: UiPageProps) {
	return (
		<>
			<h2 className="text-text mb-6">{title}</h2>
			<div className="space-y-8">{children}</div>
		</>
	);
}
