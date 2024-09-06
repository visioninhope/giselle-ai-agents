import type { ComponentProps, FC } from "react";
import { CreateAgentButton } from "./component";
import { CreateAgentButtonContextProvider } from "./provider";

export const CompositeComponent: FC<
	ComponentProps<typeof CreateAgentButtonContextProvider>
> = (props) => {
	return (
		<CreateAgentButtonContextProvider {...props}>
			<CreateAgentButton />
		</CreateAgentButtonContextProvider>
	);
};
