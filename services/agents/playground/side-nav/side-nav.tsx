import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpenIcon, LayersIcon } from "lucide-react";
import { type FC, useState } from "react";
import type { JSX } from "react/jsx-runtime";

type NavItemProps = {
	icon: JSX.Element;
	tooltip: string;
	onClick: () => void;
};
const NavItem: FC<NavItemProps> = ({ icon, tooltip, onClick }) => {
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger className="flex justify-center" onClick={onClick}>
					{icon}
				</TooltipTrigger>
				<TooltipContent side="right">
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export const SideNav: FC = () => {
	const [activeMenu, setActiveMenu] = useState("");
	return (
		<div className="relative">
			<div className="bg-slate-800 h-full px-2 pt-8 w-[60px]">
				<div className="flex flex-col gap-4">
					<NavItem
						icon={<LayersIcon />}
						tooltip="Overview"
						onClick={() => setActiveMenu("overview")}
					/>
					<NavItem
						icon={<BookOpenIcon />}
						tooltip="Knowledges"
						onClick={() => setActiveMenu("knowledges")}
					/>
				</div>
			</div>
			{activeMenu === "overview" && (
				<div className="bg-green-800 h-full px-2 pt-8 absolute top-0 right-0 translate-x-[100%] z-10">
					Overview
				</div>
			)}
			{activeMenu === "knowledges" && (
				<div className="bg-blue-800 h-full px-2 pt-8 absolute top-0 right-0 translate-x-[100%] z-10">
					Knowledge
				</div>
			)}
		</div>
	);
};
