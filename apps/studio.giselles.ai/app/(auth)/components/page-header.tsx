import type { FC } from "react";

export type PageTitleProps = {
	title: string;
};

export const PageHeader: FC<PageTitleProps> = ({ title }) => (
	<h1 className="text-3xl text-black-30 font-hubot font-medium">
		{title}
	</h1>
);
