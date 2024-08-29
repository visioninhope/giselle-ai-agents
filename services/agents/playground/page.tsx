import { ReactFlowProvider } from "@xyflow/react";
import type { FC } from "react";
import { Inner } from "./inner";
import {
	PlaygroundProvider,
	type PlaygroundProviderProps,
} from "./playground-context";

type PlaygroundProps = PlaygroundProviderProps;
export const Playground: FC<PlaygroundProps> = ({
	agentId,
	requestRunnerProvider,
}) => {
	return (
		<PlaygroundProvider
			agentId={agentId}
			requestRunnerProvider={requestRunnerProvider}
		>
			<ReactFlowProvider>
				<Inner />
			</ReactFlowProvider>
		</PlaygroundProvider>
	);
};
