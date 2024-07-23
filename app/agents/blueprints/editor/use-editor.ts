import {
	useAddEdgeAction,
	useAddNodeAction,
	useBlueprint,
	useBlueprintId,
	useDeleteEdgesAction,
	useDeleteNodesAction,
	useUpdateNodesPositionAction,
} from "@/app/agents/blueprints";
import type { AgentRequest } from "@/app/agents/requests";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";

export const useEditor = (request: AgentRequest | undefined) => {
	const blueprintId = useBlueprintId();
	const { blueprint } = useBlueprint();
	const reactFlowInstance = useReactFlow();
	const { addNode } = useAddNodeAction();
	const { updateNodesPosition } = useUpdateNodesPositionAction();
	const { deleteNodes } = useDeleteNodesAction();
	const { addEdge } = useAddEdgeAction();
	const { deleteEdges } = useDeleteEdgesAction();
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
					className: node.className,
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
