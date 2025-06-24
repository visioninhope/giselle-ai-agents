import clsx from "clsx/lite";
import { DraftingCompassIcon } from "lucide-react";
import { Tabs } from "radix-ui";

export function SideMenu() {
	return (
		<div className="px-[8px] flex flex-col gap-[16px]">
			<Tabs.List
				className={clsx(
					"flex flex-col w-full text-white-800 text-[14px]",
					"**:data-list-wrapper:py-[1px] **:data-list-wrapper:cursor-pointer ",
					"**:data-list:flex **:data-list:items-center **:data-list:gap-[4px] **:data-list:px-[8px]",
					"**:data-list:py-[4px] **:data-list:rounded-[2px]",
					"**:data-list:group-hover:bg-black-400/40",
					"**:data-list:transition-colors",
					"**:data-list:group-data-[state=active]:bg-black-750",
					"**:data-list:group",
					"**:data-icon:size-[16px] **:data-icon:shrink-0 **:data-icon:text-white-400",
					"**:data-icon:group-hover:text-white-800",
					"**:data-icon:transition-colors",
				)}
			>
				<Tabs.Trigger value="builder" className="group" data-list-wrapper>
					<div data-list>
						<DraftingCompassIcon data-icon />
						<p>Builder</p>
					</div>
				</Tabs.Trigger>
			</Tabs.List>
		</div>
	);
}
