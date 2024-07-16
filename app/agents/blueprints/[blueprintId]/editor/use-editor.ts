import { useBlueprint } from "@/app/agents/blueprints";
import type { AgentRequest } from "@/app/agents/requests";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useAddEdgeAction, useDeleteEdgesAction } from "../edges";
import {
	useAddNodeAction,
	useDeleteNodesAction,
	useUpdateNodesPositionAction,
} from "../nodes/";

export const useEditor = (
	blueprintId: number | undefined,
	request: AgentRequest | undefined,
) => {
	const { blueprint } = useBlueprint(blueprintId);
	const reactFlowInstance = useReactFlow();
	const { addNode } = useAddNodeAction(blueprintId);
	const { updateNodesPosition } = useUpdateNodesPositionAction(blueprintId);
	const { deleteNodes } = useDeleteNodesAction(blueprintId);
	const { addEdge } = useAddEdgeAction(blueprintId);
	const { deleteEdges } = useDeleteEdgesAction(blueprintId);
	useEffect(() => {
		if (blueprint == null) {
			return;
		}
		const nodes = blueprint.nodes.map((node) => {
			const relevantRequestStep = request?.steps.find(
				(step) => step.node.id === node.id,
			);

			const currentNode = reactFlowInstance.getNode(`${node.id}`);
			return {
				...currentNode,
				id: `${node.id}`,
				type: "v3",
				position: node.position,
				data: {
					id: `${node.id}`,
					nodeType: node.class,
					stepStatus: relevantRequestStep?.status,
					inputPorts: node.inputPorts,
					outputPorts: node.outputPorts,
				},
			};
		});
		const edges = blueprint.edges.map(({ id, inputPort, outputPort }) => ({
			id: `${id}`,
			source: `${outputPort.nodeId}`,
			sourceHandle: `${outputPort.id}`,
			target: `${inputPort.nodeId}`,
			targetHandle: `${inputPort.id}`,
		}));
		reactFlowInstance.setNodes(nodes);
		reactFlowInstance.setEdges(edges);
	}, [blueprint, request, reactFlowInstance]);

	return {
		addNode,
		updateNodesPosition,
		deleteNodes,
		addEdge,
		deleteEdges,
	};
};
