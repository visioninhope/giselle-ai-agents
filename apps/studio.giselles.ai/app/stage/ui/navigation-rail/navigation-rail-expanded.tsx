import { NavigationRailContainer } from "./navigation-rail-container";

export function NavigationRailExpanded({
	onCollapsedButtonClick,
}: {
	onCollapsedButtonClick: () => void;
}) {
	return (
		<NavigationRailContainer variant="expanded">
			hello
			<button onClick={() => onCollapsedButtonClick()} type="button">
				Open
			</button>
		</NavigationRailContainer>
	);
}
