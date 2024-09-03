import { db, tasks } from "@/drizzle";
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { Suspense } from "react";
import type { RequestRunnerProvider } from "../requests/types";
import type { AgentId } from "../types";
import { getGraph } from "./actions/get-graph";
import { PlaygroundProvider } from "./context";
import { Inner } from "./inner";
import { SideNav } from "./side-nav";

export const Knowledges = async () => {
	const getTasks = async () => {
		const result = await db.select().from(tasks);
		return result;
	};
	const allTasks = await getTasks();
	return (
		<ul>
			{allTasks.map((task) => (
				<li key={task.id}>{task.name}</li>
			))}
		</ul>
	);
};

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
	userId: string;
	requestRunnerProvider: RequestRunnerProvider;
};
export async function Playground({
	agentId,
	userId,
	requestRunnerProvider,
}: PlaygroundProps) {
	const graph = await getGraph({ agentId, userId });
	return (
		<Suspense fallback={<Skeleton />}>
			<PlaygroundProvider
				agentId={agentId}
				requestRunnerProvider={requestRunnerProvider}
				userId={userId}
				graph={graph}
			>
				<ReactFlowProvider>
					<div className="h-screen w-full flex">
						<SideNav
							knowledge={
								<Suspense fallback={<div>Loading...</div>}>
									<Knowledges />
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
