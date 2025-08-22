export function NavigationRailHeader({ children }: React.PropsWithChildren) {
	return (
		<div className="h-navigation-rail-header flex items-center justify-start p-1.5 translate-x-1">
			{children}
		</div>
	);
}
