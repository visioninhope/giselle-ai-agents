import { GiselleIcon } from "@giselle-internal/workflow-designer-ui";
import { PanelLeftCloseIcon } from "lucide-react";
import { MenuButton } from "./menu-button";
import { navigationItems } from "./navigation-items";
import { NavigationList } from "./navigation-list";
import { NavigationListItem } from "./navigation-list-item";
import { NavigationRailContainer } from "./navigation-rail-container";
import { NavigationRailContentsContainer } from "./navigation-rail-contents-container";
import { NavigationRailFooter } from "./navigation-rail-footer";
import { NavigationRailHeader } from "./navigation-rail-header";

export function NavigationRailExpanded({
	onCollapseButtonClick,
}: {
	onCollapseButtonClick: () => void;
}) {
	return (
		<NavigationRailContainer variant="expanded">
			<NavigationRailHeader>
				<div className="flex items-center justify-start w-full">
					<div className="size-8 flex justify-center items-center">
						<GiselleIcon className="size-6 text-text-muted stroke-1 group-hover:hidden shrink-0" />
					</div>
					<p className="text-white-900 text-[13px] font-semibold">Stage</p>
				</div>
				<div className="absolute right-3 top-1.5">
					<MenuButton
						onClick={() => onCollapseButtonClick()}
						className="cursor-w-resize"
					>
						<PanelLeftCloseIcon className="size-6 text-text-muted stroke-1" />
					</MenuButton>
				</div>
			</NavigationRailHeader>
			<NavigationRailContentsContainer>
				<NavigationList>
					{navigationItems.map((navigationItem) => (
						<NavigationListItem key={navigationItem.id} {...navigationItem} />
					))}
				</NavigationList>
			</NavigationRailContentsContainer>
			<NavigationRailFooter>
				<p>Footer</p>
			</NavigationRailFooter>
		</NavigationRailContainer>
	);
}
