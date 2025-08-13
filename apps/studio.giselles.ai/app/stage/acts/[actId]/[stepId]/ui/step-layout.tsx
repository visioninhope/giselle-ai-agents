import type { ReactNode } from "react";

interface StepLayoutProps {
	header: ReactNode;
	children: ReactNode;
}

export function StepLayout({ header, children }: StepLayoutProps) {
	return (
		<div className="flex flex-col w-full">
			<header className="bg-tab-active-background p-[16px] flex items-center">
				{header}
			</header>
			<main className="p-[16px] overflow-y-auto">
				<div className="max-w-[600px] mx-auto">{children}</div>
			</main>
		</div>
	);
}
