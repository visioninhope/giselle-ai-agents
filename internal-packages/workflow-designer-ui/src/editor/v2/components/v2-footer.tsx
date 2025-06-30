"use client";

import {
	DatabaseIcon,
	ExternalLinkIcon,
	FileKey2Icon,
	HistoryIcon,
	MessageCircleIcon,
} from "lucide-react";
import type { LeftPanelValue } from "../state";

interface V2FooterProps {
	onLeftPaelValueChange: (leftMenu: LeftPanelValue) => void;
}

export function V2Footer({ onLeftPaelValueChange }: V2FooterProps) {
	return (
		<footer className="h-[30px] border-t border-black-600 px-6 flex items-center">
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center space-x-3">
					<button
						type="button"
						onClick={() => onLeftPaelValueChange("run-history")}
						className="text-white-900 hover:text-[#6B8FF0] cursor-pointer"
						title="Run History"
					>
						<HistoryIcon className="w-[14px] h-[14px]" />
					</button>
					<button
						type="button"
						onClick={() => onLeftPaelValueChange("secret")}
						className="text-white-900 hover:text-[#6B8FF0] cursor-pointer"
						title="Secrets"
					>
						<FileKey2Icon className="w-[14px] h-[14px]" />
					</button>
					<button
						type="button"
						onClick={() => onLeftPaelValueChange("data-source")}
						className="text-white-900 hover:text-[#6B8FF0] cursor-pointer"
						title="Data Source"
					>
						<DatabaseIcon className="w-[14px] h-[14px]" />
					</button>
				</div>
				<div className="flex items-center space-x-3">
					<button
						type="button"
						className="text-white-900 hover:text-[#6B8FF0] cursor-pointer"
						title="Chat"
					>
						<MessageCircleIcon className="w-[14px] h-[14px]" />
					</button>
					<a
						href="https://docs.giselles.ai/guides/introduction"
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-white-900 hover:text-[#6B8FF0] flex items-center gap-1"
					>
						Docs
						<ExternalLinkIcon className="w-[10px] h-[10px]" />
					</a>
				</div>
			</div>
		</footer>
	);
}
