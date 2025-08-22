import { GiselleIcon } from "@giselle-internal/workflow-designer-ui";
import { PanelLeftCloseIcon } from "lucide-react";
import { MenuButton } from "./menu-button";
import { NavigationRailContainer } from "./navigation-rail-container";
import { NavigationRailHeader } from "./navigation-rail-header";

export function NavigationRailExpanded({
	onCollapseButtonClick,
}: {
	onCollapseButtonClick: () => void;
}) {
	return (
		<NavigationRailContainer variant="expanded">
			<NavigationRailHeader>
				<div className="flex items-center p-1.5 justify-center w-full">
					<GiselleIcon className="size-6 text-text-muted stroke-1 group-hover:hidden" />
				</div>
				<div className="absolute right-1.5 top-1.5">
					<MenuButton onClick={() => onCollapseButtonClick()}>
						<PanelLeftCloseIcon className="size-6 text-text-muted stroke-1" />
					</MenuButton>
				</div>
			</NavigationRailHeader>
			<button onClick={() => onCollapseButtonClick()} type="button">
				Open
			</button>
		</NavigationRailContainer>
	);
}
