import { Button } from "@/components/ui/button";
import type { FC, PropsWithChildren } from "react";

type CardProps = {
	title: string;
	description?: string;
};
export const Card: FC<PropsWithChildren<CardProps>> = ({
	title,
	description,
	children,
}) => (
	<div className="bg-transparent rounded-[16px] border border-black-70 py-[16px] px-[24px] w-full gap-[16px] grid">
		<div className="flex justify-between">
			<div className="grid gap-[3px] font-[Avenir]">
				<h2 className="text-black-30 text-[16px]">{title}</h2>
				{description && (
					<p className="text-[12px] text-black-70">{description}</p>
				)}
			</div>
			{/**<Button type="button">Edit</Button>**/}
		</div>
		{children}
	</div>
);
