import { agents, db } from "@/drizzle";
import { playgroundV2Flag } from "@/flags";
import { del, list, put } from "@vercel/blob";
import { ReactFlowProvider } from "@xyflow/react";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { AgentId } from "../beta-proto/types";
import { Editor } from "./components/editor";
import { GraphContextProvider } from "./contexts/graph";
import { MousePositionProvider } from "./contexts/mouse-position";
import { PropertiesPanelProvider } from "./contexts/properties-panel";
import { ToolbarContextProvider } from "./contexts/toolbar";
import type { Graph } from "./types";
import {
	buildGraphFolderPath,
	buildGraphPath,
	createGraphId,
	pathJoin,
} from "./utils";

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

	async function persistGraph(graph: Graph) {
		"use server";
		const { url } = await put(buildGraphPath(graph.id), JSON.stringify(graph), {
			access: "public",
		});
		await db
			.update(agents)
			.set({
				graphUrl: url,
			})
			.where(eq(agents.id, agentId));
		const blobList = await list({
			prefix: buildGraphFolderPath(graph.id),
		});

		const oldBlobUrls = blobList.blobs
			.filter((blob) => blob.url !== url)
			.map((blob) => blob.url);
		if (oldBlobUrls.length > 0) {
			await del(oldBlobUrls);
		}
	}

	return (
		<GraphContextProvider defaultGraph={graph} onPersistAction={persistGraph}>
			<PropertiesPanelProvider>
				<ReactFlowProvider>
					<ToolbarContextProvider>
						<MousePositionProvider>
							<Editor />
						</MousePositionProvider>
					</ToolbarContextProvider>
				</ReactFlowProvider>
			</PropertiesPanelProvider>
		</GraphContextProvider>
	);
}
