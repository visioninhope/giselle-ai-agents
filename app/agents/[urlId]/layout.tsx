import {
	BlueprintProvider,
	getBlueprint,
	getLatestBlueprint,
} from "@/app/agents/blueprints";

import "@xyflow/react/dist/style.css";
import { NodeClassesProvider, getNodeClasses } from "@/app/node-classes";
import { agents, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { AgentProvider } from "../contexts";
export default async function Layout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: { urlId: string };
}>) {
	const agent = await db.query.agents.findFirst({
		where: eq(agents.urlId, params.urlId),
	});
	invariant(agent != null, "Agent not found");
	const latestBlueprint = await getLatestBlueprint(params.urlId);
	const blueprint = await getBlueprint(latestBlueprint.id);
	return (
		<div className="w-screen h-screen flex flex-col">
			<BlueprintProvider blueprint={blueprint}>
				<NodeClassesProvider nodeClasses={getNodeClasses()}>
					<AgentProvider agent={agent}>{children}</AgentProvider>
				</NodeClassesProvider>
			</BlueprintProvider>
		</div>
	);
}
