"use client";

import {
	DatabaseIcon,
	ExternalLinkIcon,
	FileKey2Icon,
	HistoryIcon,
	MessageCircleIcon,
} from "lucide-react";
import { Tooltip } from "../../../ui/tooltip";
import type { LeftPanelValue } from "../state";

interface V2FooterProps {
	onLeftPaelValueChange?: (value: LeftPanelValue) => void;
	onChatToggle?: () => void;
	activePanel?: LeftPanelValue | null;
	isChatOpen?: boolean;
}

export function V2Footer({
	onLeftPaelValueChange,
	onChatToggle,
	activePanel,
	isChatOpen,
}: V2FooterProps) {
	return (
		<footer className="h-[30px] border-t border-white/10 px-4 flex items-center">
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center space-x-3">
					<Tooltip
						text="Run History"
						variant="dark"
						className="border border-white-400/20"
						sideOffset={-4}
						side="top"
						align="start"
					>
						<button
							type="button"
							onClick={() => onLeftPaelValueChange?.("run-history")}
							data-panel-trigger="run-history"
							className={`cursor-pointer ${
								activePanel === "run-history"
									? "text-[#6B8FF0]"
									: "text-white-900 hover:text-[#6B8FF0]"
							}`}
						>
							<HistoryIcon className="w-[14px] h-[14px]" />
						</button>
					</Tooltip>
					<Tooltip
						text="Secrets"
						variant="dark"
						className="border border-white-400/20"
						sideOffset={-4}
						side="top"
						align="start"
					>
						<button
							type="button"
							onClick={() => onLeftPaelValueChange?.("secret")}
							data-panel-trigger="secret"
							className={`cursor-pointer ${
								activePanel === "secret"
									? "text-[#6B8FF0]"
									: "text-white-900 hover:text-[#6B8FF0]"
							}`}
						>
							<FileKey2Icon className="w-[14px] h-[14px]" />
						</button>
					</Tooltip>
					<Tooltip
						text="Data Source"
						variant="dark"
						className="border border-white-400/20"
						sideOffset={-4}
						side="top"
						align="start"
					>
						<button
							type="button"
							onClick={() => onLeftPaelValueChange?.("data-source")}
							data-panel-trigger="data-source"
							className={`cursor-pointer ${
								activePanel === "data-source"
									? "text-[#6B8FF0]"
									: "text-white-900 hover:text-[#6B8FF0]"
							}`}
						>
							<DatabaseIcon className="w-[14px] h-[14px]" />
						</button>
					</Tooltip>
				</div>
				<div className="flex items-center space-x-3">
					<Tooltip
						text="Chat"
						variant="dark"
						className="border border-white-400/20"
						sideOffset={-4}
						side="top"
						align="start"
					>
						<button
							type="button"
							onClick={onChatToggle}
							data-panel-trigger="chat"
							className={`cursor-pointer ${
								isChatOpen
									? "text-[#6B8FF0]"
									: "text-white-900 hover:text-[#6B8FF0]"
							}`}
						>
							<MessageCircleIcon className="w-[14px] h-[14px]" />
						</button>
					</Tooltip>
					<Tooltip
						text="Documentation"
						variant="dark"
						className="border border-white-400/20"
						sideOffset={-4}
						side="top"
						align="start"
					>
						<a
							href="https://docs.giselles.ai/guides/introduction"
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-white-900 hover:text-[#6B8FF0] flex items-center gap-1"
						>
							Docs
							<ExternalLinkIcon className="w-[10px] h-[10px]" />
						</a>
					</Tooltip>
				</div>
			</div>
		</footer>
	);
}
