import type { FC, PropsWithChildren } from "react";

export const PageTitle: FC<PropsWithChildren> = ({ children }) => (
	<h2 className="text-3xl font-medium text-black-30 font-hubot text-center">
		{children}
	</h2>
);
