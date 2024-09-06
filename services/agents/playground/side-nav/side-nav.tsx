"use client";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { BookOpenIcon, LayersIcon, XIcon } from "lucide-react";
import { type FC, type ReactNode, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { match } from "ts-pattern";

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

type SideNavProps = {
	knowledge: ReactNode;
};
export const SideNav: FC<SideNavProps> = ({ knowledge }) => {
	const [activeMenu, setActiveMenu] = useState("");
	const [show, setShow] = useState(false);
	return (
		<div className="relative">
			<div className="bg-slate-800 h-full px-2 pt-8 w-[60px]">
				<div className="flex flex-col gap-4">
					<NavItem
						icon={<LayersIcon />}
						tooltip="Overview"
						onClick={() => {
							setShow(true);
							setActiveMenu("overview");
						}}
					/>
					<NavItem
						icon={<BookOpenIcon />}
						tooltip="Knowledges"
						onClick={() => {
							setShow(true);
							setActiveMenu("knowledges");
						}}
					/>
				</div>
			</div>
			<LazyMotion features={domAnimation}>
				<AnimatePresence>
					{show && (
						<m.div
							className="bg-green-800 h-full pt-8 absolute top-0 right-0 translate-x-[100%] z-10 overflow-x-hidden"
							initial={{ width: 0 }}
							animate={{ width: "300px" }}
							exit={{ width: 0 }}
						>
							<div className="w-[300px] px-2">
								<div className="flex justify-end">
									<button
										type="button"
										onClick={() => {
											setShow(false);
										}}
									>
										<XIcon />
									</button>
								</div>
								<div>
									{match(activeMenu)
										.with("overview", () => "Overview")
										.with("knowledges", () => knowledge)
										.otherwise(() => null)}
								</div>
							</div>
						</m.div>
					)}
				</AnimatePresence>
			</LazyMotion>
		</div>
	);
};
