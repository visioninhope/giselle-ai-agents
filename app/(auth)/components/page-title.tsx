import type { FC, PropsWithChildren } from "react";

export const PageTitle: FC<PropsWithChildren> = ({ children }) => (
	<h2 className="mt-6 text-3xl font-bold text-black-30 font-[Rosart] text-center">
		{children}
	</h2>
);
