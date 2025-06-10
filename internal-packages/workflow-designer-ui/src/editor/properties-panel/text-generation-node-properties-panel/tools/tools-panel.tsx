import { ChevronRight, Database } from "lucide-react";
import { GitHubIcon } from "../../../tool";

export function ToolsPanel() {
	const enabledConnectors = [
		{
			name: "GitHub",
			icon: GitHubIcon,
		},
	];

	const availableConnectors = [
		{
			name: "PostgreSQL",
			icon: Database,
		},
	];

	return (
		<div className="text-white-400 space-y-[16px]">
			<div className="space-y-[8px]">
				<h2 className="text-[15px] font-accent">Enabled Tools</h2>
				<div className="space-y-[2px]">
					{enabledConnectors.map((connector) => (
						<div
							key={connector.name}
							className="border border-black-400 rounded-[8px] p-[6px] flex items-center justify-between hover:bg-black-800/50 transition-all duration-200 cursor-pointer h-[52px]"
						>
							<div className="flex gap-[8px]">
								<div className="rounded-[6px] size-[38px] flex items-center justify-center bg-white-400/40">
									<connector.icon className="size-[24px] text-white" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h3 className="text-[15px]">{connector.name}</h3>
									</div>
									<p className="text-black-300 text-[11px]">2 tools enabled</p>
								</div>
							</div>
							<ChevronRight className="w-5 h-5 text-gray-400" />
						</div>
					))}
				</div>
			</div>

			<div className="space-y-[8px]">
				<h2 className="text-[15px] font-accent">Available Tools</h2>
				<div className="space-y-[2px]">
					{availableConnectors.map((connector) => (
						<div
							key={connector.name}
							className="border border-black-400 rounded-[8px] p-[6px] flex items-center justify-between hover:bg-black-800/50 transition-all duration-200 cursor-pointer h-[52px]"
						>
							<div className="flex gap-[8px]">
								<div className="rounded-[6px] size-[38px] shrink-0 aspect-square flex items-center justify-center bg-white-400/40">
									<connector.icon className="size-[24px] text-white" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h3 className="text-[15px]">{connector.name}</h3>
									</div>
									<p className="text-black-300 text-[11px]">
										Add {connector.name} tool
									</p>
								</div>
							</div>
							<ChevronRight className="w-5 h-5 text-gray-400" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
