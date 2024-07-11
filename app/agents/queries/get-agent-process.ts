import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { asc, desc, eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { getAgentWithLatestBlueprint } from "../[urlId]/_helpers/get-blueprint";
import type { AgentProcess } from "../models/agent-process";

/** @todo Get a specific run */
export const getAgentProcess = async (urlId: string): Promise<AgentProcess> => {
	const agent = await getAgentWithLatestBlueprint(urlId);
	const nodes = await db.query.nodes.findMany({
		columns: {
			id: true,
			type: true,
		},
		where: eq(schema.nodes.blueprintId, agent.latestBlueprint.id),
	});
	const processes = await db.query.processes.findMany({
		columns: {
			id: true,
			nodeId: true,
		},
		where: eq(schema.processes.blueprintId, agent.latestBlueprint.id),
		orderBy: asc(schema.processes.order),
	});
	const latestRun = await db.query.runs.findFirst({
		columns: {
			id: true,
			status: true,
		},
		where: eq(schema.runs.blueprintId, agent.latestBlueprint.id),
		orderBy: desc(schema.runs.createdAt),
	});
	console.log({ latestRun });
	const latestRunProcesses =
		latestRun == null
			? []
			: await db.query.runProcesses.findMany({
					columns: {
						id: true,
						processId: true,
						status: true,
					},
					where: eq(schema.runProcesses.runId, latestRun.id),
				});
	console.log({ nodes, latestRunProcesses });
	const latestRunProcessesWithNodes = processes.map(({ id, nodeId }) => {
		const node = nodes.find((n) => n.id === nodeId);
		const latestRunProcess = latestRunProcesses.find(
			(runProcess) => runProcess.processId === id,
		);
		invariant(node != null, `No node found for process ${id}`);
		invariant(
			latestRunProcess != null,
			`No run process found for process ${id}`,
		);
		return {
			id,
			node: {
				id: node.id,
				type: node.type,
			},
			status: latestRunProcess.status,
			run: {
				id: latestRunProcess.id,
			},
		};
	});
	return {
		agent: {
			id: agent.id,
			blueprint: {
				id: agent.latestBlueprint.id,
			},
		},
		run:
			latestRun == null
				? null
				: {
						id: latestRun.id,
						status: latestRun.status,
						processes: latestRunProcessesWithNodes,
					},
	};
};
