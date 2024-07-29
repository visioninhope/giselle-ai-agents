import { useBlueprint } from "@/app/agents/blueprints";
import { useRequest } from "@/app/agents/requests";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import type { NodeV3 } from "../node/nodev3";

export const useSynthsize = () => {
	const { blueprint } = useBlueprint();
	const request = useRequest();
	const reactFlowInstance = useReactFlow<NodeV3>();
	useEffect(() => {
		const nodes = blueprint.nodes.map(
			({
				position,
				className,
				inputPorts,
				outputPorts,
				properties,
				isCreating,
				...node
			}) => {
				const relevantRequestStep = request?.steps.find(
					(step) => step.node.id === node.id,
				);

				const currentNode = reactFlowInstance.getNode(`${node.id}`);
				return {
					...currentNode,
					id: `${node.id}`,
					type: "v3",
					position,
					draggable: !isCreating,
					selectable: !isCreating,
					connectable: !isCreating,
					data: {
						id: `${node.id}`,
						className,
						stepStatus: relevantRequestStep?.status,
						inputPorts,
						outputPorts,
						nodeProperties: properties,
						isCreating,
					},
				};
			},
		);
		const edges = blueprint.edges.map(
			({ id, inputPort, outputPort, isCreating }) => ({
				id: `${id}`,
				source: `${outputPort.nodeId}`,
				sourceHandle: `${outputPort.id}`,
				target: `${inputPort.nodeId}`,
				targetHandle: `${inputPort.id}`,
				isCreating,
			}),
		);
		reactFlowInstance.setNodes(nodes);
		reactFlowInstance.setEdges(edges);
	}, [
		blueprint,
		request,
		reactFlowInstance.setNodes,
		reactFlowInstance.setEdges,
		reactFlowInstance.getNode,
	]);
};
