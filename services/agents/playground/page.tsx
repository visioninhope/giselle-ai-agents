import { db, tasks } from "@/drizzle";
import { ReactFlowProvider } from "@xyflow/react";
import { unstable_cache } from "next/cache";
import { type FC, Suspense } from "react";
import { Inner } from "./inner";
import {
	PlaygroundProvider,
	type PlaygroundProviderProps,
} from "./playground-context";
import { SideNav } from "./side-nav";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const Knowledges = async () => {
	const getTasks = async () => {
		await sleep(3000);
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

type PlaygroundProps = PlaygroundProviderProps;
export const Playground: FC<PlaygroundProps> = ({
	agentId,
	requestRunnerProvider,
	userId,
}) => {
	return (
		<PlaygroundProvider
			agentId={agentId}
			requestRunnerProvider={requestRunnerProvider}
			userId={userId}
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
	);
};
