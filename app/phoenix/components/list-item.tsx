import type { FC, ReactNode } from "react";

type ListItemProps = {
	icon: ReactNode;
	title: string;
};
export const ListItem: FC<ListItemProps> = ({ icon, title }) => (
	<div
		className={"flex gap-[8px] px-[16[px] py-[8px] min-w-[150px] items-center"}
	>
		<div className="flex items-center">{icon}</div>
		<div className="font-avenir text-[14px] text-black-30">{title}</div>
	</div>
);
