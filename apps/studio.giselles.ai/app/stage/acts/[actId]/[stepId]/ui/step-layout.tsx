"use client";

import { CheckCircle, Copy, Download } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface StepLayoutProps {
	header: ReactNode;
	children: ReactNode;
}

export function StepLayout({ header, children }: StepLayoutProps) {
	const [copyFeedback, setCopyFeedback] = useState(false);

	const handleCopyToClipboard = async () => {
		try {
			// Get the text content from the main content area
			const mainContent = document.querySelector('main [class*="max-w-"]');
			if (mainContent) {
				const textContent = mainContent.textContent || "";
				await navigator.clipboard.writeText(textContent);
				setCopyFeedback(true);
				setTimeout(() => setCopyFeedback(false), 2000);
			}
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	};

	return (
		<div className="flex flex-col w-full h-full">
			<header className="bg-gray-900/80 p-4 md:p-[16px] flex items-center justify-between border-b md:border-b-0 border-white/10">
				{header}
				<div className="flex items-center gap-1">
					<button
						type="button"
						className="p-3 md:p-2 hover:bg-white/10 rounded-lg transition-colors group relative touch-manipulation"
						title={copyFeedback ? "Copied!" : "Copy content"}
						onClick={handleCopyToClipboard}
					>
						{copyFeedback ? (
							<CheckCircle className="size-5 md:size-4 text-green-400" />
						) : (
							<Copy className="size-5 md:size-4 text-white/70 group-hover:text-white transition-colors" />
						)}
					</button>
					<button
						type="button"
						className="p-3 md:p-2 hover:bg-white/10 rounded-lg transition-colors group touch-manipulation"
						title="Download content"
					>
						<Download className="size-5 md:size-4 text-white/70 group-hover:text-white transition-colors" />
					</button>
				</div>
			</header>
			<main className="p-4 md:p-[16px] overflow-y-auto flex-1">
				<div className="max-w-none md:max-w-[800px] md:mx-auto">{children}</div>
			</main>
		</div>
	);
}
