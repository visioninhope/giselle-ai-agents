export const NavigationRailFooter = ({ children }: React.PropsWithChildren) => {
	return (
		<div className="data-slot-navigation-rail-footer absolute bottom-0 h-navigation-rail-footer flex items-center w-full p-1.5">
			{children}
		</div>
	);
};
