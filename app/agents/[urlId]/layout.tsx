import {
	BlueprintProvider,
	getBlueprint,
	getLatestBlueprint,
} from "@/app/agents/blueprints";
import "@xyflow/react/dist/style.css";
import { NodeClassesProvider, getNodeClasses } from "@/app/node-classes";
import { agents, db } from "@/drizzle";
import { createClient } from "@/lib/supabase";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";
import { AgentProvider } from "../contexts";

export default async function Layout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: { urlId: string };
}>) {
	const supabase = createClient();

	const { data, error } = await supabase.auth.getUser();
	if (error || !data?.user) {
		redirect("/login");
	}

	const agent = await db.query.agents.findFirst({
		where: eq(agents.urlId, params.urlId),
	});
	invariant(agent != null, "Agent not found");
	const latestBlueprint = await getLatestBlueprint(params.urlId);
	const blueprint = await getBlueprint(latestBlueprint.id);
	return (
		<div className="w-screen h-screen flex flex-col">
			<AgentProvider agent={agent}>
				<BlueprintProvider blueprint={blueprint}>
					<NodeClassesProvider nodeClasses={getNodeClasses()}>
						{children}
					</NodeClassesProvider>
				</BlueprintProvider>
			</AgentProvider>
		</div>
	);
}
