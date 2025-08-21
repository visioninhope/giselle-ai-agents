import { WilliIcon } from "@giselle-internal/workflow-designer-ui";
import { LibraryIcon } from "lucide-react";

export const tinySidebarWidthClassName = "w-16";
export const sidebarWidthClassName = "w-64";

export const links = [
	{
		icon: LibraryIcon,
		label: "Showcase",
		href: "/stage/showcase",
		isActive: (pathname: string) => pathname === "/stage/showcase",
	},
	{
		icon: WilliIcon,
		label: "Tasks",
		href: "/stage/acts",
		isActive: (pathname: string) => pathname.startsWith("/stage/acts"),
	},
] as const;
