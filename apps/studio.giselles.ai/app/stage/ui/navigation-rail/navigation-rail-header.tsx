export function NavigationRailHeader({ children }: React.PropsWithChildren) {
	return (
		<div className="h-navigation-rail-header flex items-center justify-center w-navigation-rail-collapsed">
			{children}
		</div>
	);
}
