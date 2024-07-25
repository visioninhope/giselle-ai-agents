import type { FC } from "react";
import { AgentName } from "./agent-name";

export const Header: FC = () => {
	return (
		<header className="bg-background h-[50px] flex items-center px-4 text-foreground">
			<AgentName />
		</header>
	);
};
