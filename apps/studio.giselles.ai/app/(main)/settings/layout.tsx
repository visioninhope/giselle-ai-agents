import type { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex divide-x divide-black-800 h-full bg-black-900">
			{children}
		</div>
	);
}
