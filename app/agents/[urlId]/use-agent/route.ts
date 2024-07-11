import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { getAgentWithLatestBlueprint } from "../_helpers/get-blueprint";
import type { AgentState } from "./agent-state";

export const POST = async () => {
	const useAgentState: AgentState = {
		agent: {
			latestRun: {
				status: "creating",
				processes: [],
			},
		},
	};
	return NextResponse.json(useAgentState);
};

export const GET = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const agent = await getAgentWithLatestBlueprint(params.urlId);
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
			run: {
				status: latestRunProcess.status,
			},
		};
	});
	const useAgentState: AgentState = {
		agent: {
			latestRun:
				latestRun == null
					? null
					: {
							status: latestRun.status,
							processes: latestRunProcessesWithNodes,
						},
		},
	};

	return NextResponse.json(useAgentState);
};
