import clsx from "clsx/lite";
import {
	DraftingCompassIcon,
	FileKey2Icon,
	HistoryIcon,
	MessageSquareIcon,
} from "lucide-react";

export function SideMenu() {
	return (
		<div className="px-[8px] flex justify-center w-full">
			<ul
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
				<li data-state="active" className="group" data-list-wrapper>
					<div data-list>
						<DraftingCompassIcon data-icon />
						<p>Builder</p>
					</div>
				</li>
				<li className="group" data-list-wrapper>
					<div data-list>
						<HistoryIcon data-icon />
						<p>Run History</p>
					</div>
				</li>
				<li className="group" data-list-wrapper>
					<div data-list>
						<FileKey2Icon data-icon />
						<p>Credentials</p>
					</div>
				</li>
			</ul>
		</div>
	);
}
