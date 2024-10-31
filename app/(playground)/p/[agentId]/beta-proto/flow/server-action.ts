"use server";

import { agents, db } from "@/drizzle";
import { put } from "@vercel/blob";
import { createStreamableValue } from "ai/rsc";
import { eq } from "drizzle-orm";
import { giselleNodeArchetypes } from "../giselle-node/blueprints";
import {
	type GiselleNodeId,
	giselleNodeCategories,
} from "../giselle-node/types";
import {
	extractSourceIndexesFromNode,
	sourceIndexesToSources,
} from "../source/utils";
import type { AgentId } from "../types";
import { type V2FlowAction, replaceFlowAction } from "./action";
import { type Flow, type FlowAction, flowActionStatuses } from "./types";

interface RunActionInput {
	agentId: AgentId;
	nodeId: GiselleNodeId;
	action: FlowAction;
	stream: boolean;
}
export async function runAction(input: RunActionInput) {
	const stream = createStreamableValue<V2FlowAction>();
	(async () => {
		stream.update(
			replaceFlowAction({
				input: {
					...input.action,
					status: flowActionStatuses.running,
				},
			}),
		);
		const agent = await db.query.agents.findFirst({
			where: eq(agents.id, input.agentId),
		});
		if (agent === undefined) {
			throw new Error(`Agent with id ${input.agentId} not found`);
		}
		const graph = agent.graphv2;

		const instructionConnector = graph.connectors.find(
			(connector) =>
				connector.target === input.nodeId &&
				connector.sourceNodeCategory === giselleNodeCategories.instruction,
		);

		if (instructionConnector === undefined) {
			throw new Error(
				`No instruction connector found for node ${input.nodeId}`,
			);
		}

		const instructionNode = graph.nodes.find(
			(node) => node.id === instructionConnector.source,
		);
		const actionNode = graph.nodes.find(
			(node) => node.id === instructionConnector.target,
		);

		if (instructionNode === undefined || actionNode === undefined) {
			throw new Error(
				`Instruction node ${instructionConnector.source} or action node ${instructionConnector.target} not found`,
			);
		}

		const sourceIndexes = extractSourceIndexesFromNode(instructionNode);
		switch (instructionConnector.targetNodeArcheType) {
			case giselleNodeArchetypes.textGenerator:
				await generateText();
				break;
			case giselleNodeArchetypes.webSearch:
				await webSearch();
				break;
		}
		stream.update(
			replaceFlowAction({
				input: {
					...input.action,
					status: flowActionStatuses.completed,
				},
			}),
		);
		stream.done();
	})();

	return {
		object: stream.value,
	};
}

async function generateText() {
	console.log(
		"\x1b[33m\x1b[1mTODO:\x1b[0m Implement text generation functionality",
	);
}

async function webSearch() {
	console.log("\x1b[33m\x1b[1mTODO:\x1b[0m Implement websearch functionality");
}

interface PutFlowInput {
	flow: Flow;
}
export async function putFlow({ input }: { input: PutFlowInput }) {
	const blob = await put(
		`/flows/${input.flow.id}/flow.json`,
		JSON.stringify(input.flow),
		{
			access: "public",
			contentType: "application/json",
		},
	);
	return blob;
}
