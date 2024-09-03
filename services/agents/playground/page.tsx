import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { Suspense } from "react";
import type { RequestRunnerProvider } from "../requests/types";
import type { AgentId } from "../types";
import { getGraph } from "./actions/get-graph";
import { PlaygroundProvider } from "./context";
import { Inner } from "./inner";
import { SideNav } from "./side-nav";
import { Knowledges } from "./side-nav/knowledge/knowledge";

const Skeleton = () => {
	return (
		<div className="h-screen w-full">
			<ReactFlow key={"loader"}>
				<Background />
			</ReactFlow>
		</div>
	);
};

type PlaygroundProps = {
	agentId: AgentId;
	requestRunnerProvider: RequestRunnerProvider;
};
export async function Playground({
	agentId,
	requestRunnerProvider,
}: PlaygroundProps) {
	const graph = await getGraph({ agentId });
	return (
		<Suspense fallback={<Skeleton />}>
			<PlaygroundProvider
				agentId={agentId}
				requestRunnerProvider={requestRunnerProvider}
				graph={graph}
			>
				<ReactFlowProvider>
					<div className="h-screen w-full flex">
						<SideNav
							knowledge={
								<Suspense fallback={<div>Loading...</div>}>
									<Knowledges agentId={agentId} />
								</Suspense>
							}
						/>
						<Inner />
					</div>
				</ReactFlowProvider>
			</PlaygroundProvider>
		</Suspense>
	);
}
