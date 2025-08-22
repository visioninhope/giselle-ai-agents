import { NavigationRailContainer } from "./navigation-rail-container";

export function NavigationRailCollapsed({
	onExpandedButtonClick,
}: {
	onExpandedButtonClick: () => void;
}) {
	return (
		<NavigationRailContainer variant="collapsed">
			<button type="button" onClick={() => onExpandedButtonClick()}>
				hello
			</button>
		</NavigationRailContainer>
	);
}
