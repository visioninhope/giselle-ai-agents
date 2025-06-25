"use client";

import type { LeftPanelValue } from "../state";

interface V2FooterProps {
	onLeftPaelValueChange: (leftMenu: LeftPanelValue) => void;
}

export function V2Footer({ onLeftPaelValueChange }: V2FooterProps) {
	return (
		<footer className="bg-surface-background border-t border-border px-6 py-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<button
						type="button"
						onClick={() => onLeftPaelValueChange("run-history")}
						className="text-sm text-text-subtle hover:text-text cursor-pointer"
					>
						Run History
					</button>
					<button
						type="button"
						onClick={() => onLeftPaelValueChange("secret")}
						className="text-sm text-text-subtle hover:text-text cursor-pointer"
					>
						Secrets
					</button>
					<button
						type="button"
						onClick={() => onLeftPaelValueChange("data-source")}
						className="text-sm text-text-subtle hover:text-text cursor-pointer"
					>
						Data Source
					</button>
				</div>
				<div className="flex items-center space-x-4">
					<span className="text-sm text-text-subtle">
						Nodes: 0 | Connections: 0
					</span>
					<button
						type="button"
						className="text-sm text-text-subtle hover:text-text"
					>
						Help
					</button>
				</div>
			</div>
		</footer>
	);
}
