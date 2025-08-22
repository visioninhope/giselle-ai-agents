import { GiselleIcon } from "@giselle-internal/workflow-designer-ui";
import { PanelLeftOpenIcon } from "lucide-react";
import { MenuButton } from "./menu-button";
import { navigationItems } from "./navigation-items";
import { NavigationList } from "./navigation-list";
import { NavigationListItem } from "./navigation-list-item";
import { NavigationRailContainer } from "./navigation-rail-container";
import { NavigationRailContentsContainer } from "./navigation-rail-contents-container";
import { NavigationRailHeader } from "./navigation-rail-header";

export function NavigationRailCollapsed({
	onExpandButtonClick,
}: {
	onExpandButtonClick: () => void;
}) {
	return (
		<NavigationRailContainer variant="collapsed">
			<NavigationRailHeader>
				<MenuButton
					onClick={() => onExpandButtonClick()}
					className="cursor-e-resize"
				>
					<GiselleIcon className="size-6 text-text-muted stroke-1 group-hover:hidden" />
					<PanelLeftOpenIcon className="size-6 text-text-muted stroke-1 hidden group-hover:block" />
				</MenuButton>
			</NavigationRailHeader>
			<NavigationRailContentsContainer>
				<NavigationList>
					{navigationItems.map((navigationItem) => (
						<NavigationListItem
							key={navigationItem.id}
							{...navigationItem}
							variant="collapsed"
						/>
					))}
				</NavigationList>
			</NavigationRailContentsContainer>
		</NavigationRailContainer>
	);
}
