export const NavigationRailFooter = ({ children }: React.PropsWithChildren) => {
	return (
		<div className="data-slot-navigation-rail-footer absolute bottom-0 h-navigation-rail-footer flex items-center">
			{children}
		</div>
	);
};
