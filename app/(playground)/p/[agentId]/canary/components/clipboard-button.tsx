"use client";

import { CheckCircle, FingerprintIcon, Paperclip } from "lucide-react";
import { useCallback, useState } from "react";
import { Tooltip } from "./tooltip";

interface ClipboardButtonProps {
	text: string;
	tooltip?: string;
	className?: string;
}

export default function ClipboardButton({
	tooltip = "Copy to clipboard",
	text,
	className = "",
}: ClipboardButtonProps) {
	const [isCopied, setIsCopied] = useState(false);

	const handleClick = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(text);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	}, [text]);

	return (
		<Tooltip text={isCopied ? "Copied to clipboard" : tooltip} sideOffset={4}>
			<button
				type="button"
				className={`relative ${className}`}
				onClick={handleClick}
				aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
			>
				<span
					className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCopied ? "opacity-0" : "opacity-100"}`}
				>
					<FingerprintIcon className="h-[12px] w-[12px]" />
				</span>
				<span
					className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCopied ? "opacity-100" : "opacity-0"}`}
				>
					<CheckCircle className="h-[12px] w-[12px]" />
				</span>
			</button>
		</Tooltip>
	);
}
