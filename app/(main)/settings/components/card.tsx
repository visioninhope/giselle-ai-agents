import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { FC, PropsWithChildren } from "react";

type SubmitAction = {
	href?: never;
	content: string;
	onAction: () => void;
};
type LinkAction = {
	onAction?: never;
	content: string;
	href: string;
};
type Action = SubmitAction | LinkAction;
type CardProps = {
	title: string;
	description?: string;
	action?: Action;
};
export const Card: FC<PropsWithChildren<CardProps>> = ({
	title,
	description,
	action,
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
			{action && (
				<div>
					{action.onAction != null && (
						<form action={action.onAction}>
							<Button type="submit">{action.content}</Button>
						</form>
					)}
					{action.href != null && (
						<Button asChild>
							<Link href={action.href}>{action.content}</Link>
						</Button>
					)}
				</div>
			)}
		</div>
		{children}
	</div>
);
