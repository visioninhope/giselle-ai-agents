import type { FC, ReactNode } from "react";

type PageHeaderProps = {
	title: ReactNode;
	description?: ReactNode;
};

export const PageHeader: FC<PageHeaderProps> = ({ title, description }) => (
	<div className="grid gap-[28px]">
		<h2 className="text-[20px] font-[500] text-black-30 font-sans text-center">
			{title}
		</h2>
		{description && <p className="text-black-70 text-[14px]">{description}</p>}
	</div>
);
