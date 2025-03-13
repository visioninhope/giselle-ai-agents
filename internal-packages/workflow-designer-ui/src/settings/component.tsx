import clsx from "clsx/lite";
import { Tabs } from "radix-ui";
import type { ReactNode } from "react";
import { GitHubIcon, LayersIcon } from "../icons";
import { GitHubIntegrationSettingForm } from "./github-integration";

type TabTriggerProps = Omit<
	Tabs.TabsTriggerProps,
	"value" | "children" | "className"
> & {
	icon: ReactNode;
	label: string;
};
function TabTrigger({ icon, label, ...props }: TabTriggerProps) {
	return (
		<button
			type="button"
			className={clsx(
				"relative h-[32px] rounded-[10px] px-[16px] flex items-center gap-[8px] overflow-hidden font-accent text-[14px]",
				"data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-400",
				"data-[state=active]:before:absolute data-[state=active]:before:left-0 data-[state=active]:before:w-[8px] data-[state=active]:before:bg-primary-400 data-[state=active]:before:h-full",
			)}
			{...props}
		>
			{icon}
			{label}
		</button>
	);
}

export function SettingsPanel() {
	return (
		<div className="bg-black-850 flex flex-col gap-[16px] text-white-800">
			<div>
				<p
					className="text-primary-100 font-accent text-[20px]"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Agent Settings
				</p>
			</div>
			<Tabs.Root orientation="horizontal" className="flex gap-[24px]">
				<Tabs.List
					className={clsx("flex flex-col gap-[10px] px-[8px] w-[240px]")}
				>
					<Tabs.Trigger value="agent-details" asChild>
						<TabTrigger
							label="Agent Details"
							icon={<LayersIcon className="size-[16px]" />}
						/>
					</Tabs.Trigger>
					<Tabs.Trigger value="github-integration" asChild>
						<TabTrigger
							label="GitHub Integration"
							icon={<GitHubIcon className="size-[16px]" />}
						/>
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="agent-details">
					<p>Ae</p>
				</Tabs.Content>
				<Tabs.Content value="github-integration" className="flex-1">
					<GitHubIntegrationSettingForm />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
