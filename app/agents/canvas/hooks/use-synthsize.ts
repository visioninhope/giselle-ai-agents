import { useBlueprint } from "@/app/agents/blueprints";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";

export const useSynthsize = () => {
	const blueprint = useBlueprint();
	const reactFlowInstance = useReactFlow();
	useEffect(() => {
		console.log("effect");
		const nodes = blueprint.nodes.map((node) => {
			// const relevantRequestStep = request?.steps.find(
			// 	(step) => step.node.id === node.id,
			// );

			const currentNode = reactFlowInstance.getNode(`${node.id}`);
			return {
				...currentNode,
				id: `${node.id}`,
				type: "v3",
				position: node.position,
				data: {
					id: `${node.id}`,
					className: node.className,
					// stepStatus: relevantRequestStep?.status,
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
		if (nodes.length === 0) {
			console.log("empty!!!!");
		}
		reactFlowInstance.setEdges(edges);
	}, [blueprint, reactFlowInstance]);
};
