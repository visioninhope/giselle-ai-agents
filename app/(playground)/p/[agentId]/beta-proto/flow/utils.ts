import { createId } from "@paralleldrive/cuid2";
import type { ConnectorObject } from "../connector/types";
import {
	type GiselleNodeId,
	giselleNodeCategories,
} from "../giselle-node/types";
import type { Graph } from "../graph/types";
import type { AgentId } from "../types";
import {
	type Flow,
	type FlowActionId,
	type FlowActionLayer,
	type FlowActionLayerId,
	type FlowId,
	type InitializingFlow,
	type InitializingFlowIndex,
	type QueuedFlowIndex,
	type RunningFlowIndex,
	flowActionLayerStatuses,
	flowActionStatuses,
	flowStatuses,
} from "./types";

export const createFlowId = (): FlowId => `flw_${createId()}`;
export const createFlowActionId = (): FlowActionId => `flw.act_${createId()}`;
export const createFlowActionStackId = (): FlowActionLayerId =>
	`flw.stk_${createId()}`;

function getRelevantConnectors(
	connectors: ConnectorObject[],
	targetNode: GiselleNodeId,
): ConnectorObject[] {
	const relevantConnectors: ConnectorObject[] = [];
	const relevantNodes = new Set<GiselleNodeId>([targetNode]);
	let connectorsToProcess = connectors.filter(
		(connector) => connector.target === targetNode,
	);

	while (connectorsToProcess.length > 0) {
		relevantConnectors.push(...connectorsToProcess);
		const sourceNodes = connectorsToProcess.map(
			(connector) => connector.source,
		);
		for (const node of sourceNodes) {
			relevantNodes.add(node);
		}

		connectorsToProcess = connectors.filter(
			(connector) =>
				!relevantConnectors.includes(connector) &&
				sourceNodes.includes(connector.target),
		);
	}

	return relevantConnectors;
}

function buildDependencyGraph(
	connectors: ConnectorObject[],
): Map<GiselleNodeId, Set<GiselleNodeId>> {
	const dependencyMap = new Map<GiselleNodeId, Set<GiselleNodeId>>();

	for (const connector of connectors) {
		if (connector.sourceNodeCategory === giselleNodeCategories.instruction) {
			continue;
		}
		if (!dependencyMap.has(connector.source)) {
			dependencyMap.set(connector.source, new Set());
		}
		if (!dependencyMap.has(connector.target)) {
			dependencyMap.set(connector.target, new Set());
		}
		dependencyMap.get(connector.target)?.add(connector.source);
	}

	return dependencyMap;
}

export function resolveActionLayers(
	connectors: ConnectorObject[],
	targetNode: GiselleNodeId,
): FlowActionLayer[] {
	const relevantConnectors = getRelevantConnectors(connectors, targetNode);
	const dependencyMap = buildDependencyGraph(relevantConnectors);

	const result: FlowActionLayer[] = [];
	const visited = new Set<GiselleNodeId>();
	const nodes = Array.from(dependencyMap.keys());

	while (visited.size < nodes.length) {
		const currentLayer: GiselleNodeId[] = [];

		for (const node of nodes) {
			if (!visited.has(node)) {
				const dependencies = dependencyMap.get(node) || new Set();
				const isReady = Array.from(dependencies).every((dep) =>
					visited.has(dep),
				);

				if (isReady) {
					currentLayer.push(node);
				}
			}
		}

		if (currentLayer.length === 0 && visited.size < nodes.length) {
			throw new Error("Circular dependency detected");
		}

		for (const node of currentLayer) {
			visited.add(node);
		}
		result.push({
			id: createFlowActionStackId(),
			object: "flow.actionLayer",
			status: flowActionLayerStatuses.queued,
			actions: currentLayer.map((nodeId) => ({
				id: createFlowActionId(),
				object: "flow.action",
				status: flowActionStatuses.queued,
				nodeId,
			})),
		});
	}

	return result;
}

interface BuildFlowInput {
	agentId: AgentId;
	finalNodeId: GiselleNodeId;
	graph: Pick<Graph, "nodes" | "connectors">;
}
export function buildFlow({ input }: { input: BuildFlowInput }) {
	const actionLayers = resolveActionLayers(
		input.graph.connectors,
		input.finalNodeId,
	);
	return {
		id: createFlowId(),
		object: "flow",
		agentId: input.agentId,
		status: flowStatuses.initializing,
		finalNodeId: input.finalNodeId,
		graph: {
			nodes: input.graph.nodes,
			connectors: input.graph.connectors,
		},
		actionLayers,
	} satisfies InitializingFlow;
}

export function buildFlowIndex({ input }: { input: Flow }) {
	if (input.status === flowStatuses.initializing) {
		return {
			object: "flow.index",
			id: input.id,
			status: flowStatuses.initializing,
		} satisfies InitializingFlowIndex;
	}
	if (input.status === flowStatuses.queued) {
		return {
			object: "flow.index",
			id: input.id,
			status: flowStatuses.queued,
		} satisfies QueuedFlowIndex;
	}
	if (input.status === flowStatuses.running) {
		return {
			object: "flow.index",
			id: input.id,
			status: flowStatuses.running,
			dataUrl: input.dataUrl,
		} satisfies RunningFlowIndex;
	}
	throw new Error("Invalid flow status");
}
