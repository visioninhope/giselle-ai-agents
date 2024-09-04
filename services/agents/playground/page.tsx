import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { Suspense } from "react";
import { getKnowledges } from "../knowledges";
import type { RequestRunnerProvider } from "../requests/types";
import type { AgentId } from "../types";
import { getGraph } from "./actions/get-graph";
import { PlaygroundProvider } from "./context";
import { Inner } from "./inner";
import { SideNav } from "./side-nav";
import { KnowledgeList } from "./side-nav/knowledge/knowledge-list";

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
	const [graph, knowledges] = await Promise.all([
		getGraph({ agentId }),
		getKnowledges({ agentId }),
	]);
	return (
		<Suspense fallback={<Skeleton />}>
			<PlaygroundProvider
				agentId={agentId}
				requestRunnerProvider={requestRunnerProvider}
				graph={graph}
				knowledges={knowledges}
			>
				<ReactFlowProvider>
					<div className="h-screen w-full flex">
						<SideNav knowledge={<KnowledgeList knowledges={knowledges} />} />
						<Inner />
					</div>
				</ReactFlowProvider>
			</PlaygroundProvider>
		</Suspense>
	);
}
