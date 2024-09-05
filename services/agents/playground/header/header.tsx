import type { FC, ReactNode } from "react";

type HeaderProps = {
	userButton?: ReactNode;
};
export const Header: FC<HeaderProps> = ({ userButton }) => {
	return (
		<header className="h-[60px] px-[24px] flex items-center justify-between">
			<h1>Header</h1>
			<div>{userButton}</div>
		</header>
	);
};
