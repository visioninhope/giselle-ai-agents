import { db } from "@/drizzle";
import { playgroundV2Flag } from "@/flags";
import { notFound } from "next/navigation";
import type { AgentId } from "../beta-proto/types";
import { Editor } from "./components/editor";
import { artifacts, connections, nodes } from "./mockData";
import type { Graph } from "./types";
import { createGraphId } from "./utils";

// This page is experimental. it requires PlaygroundV2Flag to show this page
export default async function Page({
	params,
}: {
	params: Promise<{ agentId: AgentId }>;
}) {
	const [playgroundV2, { agentId }] = await Promise.all([
		playgroundV2Flag(),
		params,
	]);
	if (!playgroundV2) {
		return notFound();
	}
	const agent = await db.query.agents.findFirst({
		where: (agents, { eq }) => eq(agents.id, agentId),
	});
	// TODO: Remove graphUrl null check when add notNull constrain to graphUrl column
	if (agent === undefined || agent.graphUrl === null) {
		throw new Error("Agent not found");
	}
	// TODO: Add schema validation to verify parsed graph matches expected shape
	const graph = await fetch(agent.graphUrl).then(
		(res) => res.json() as unknown as Graph,
	);
	return <Editor graph={graph} />;
}
