import { addNode, useBlueprint } from "@/app/agents/blueprints";
import type { NodeClass, Port } from "@/app/nodes";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import invariant from "tiny-invariant";

type AddNodeArgs =
	| {
			nodeClass: NodeClass;
			position: { x: number; y: number };
			relevantAgent?: never;
	  }
	| {
			nodeClassName: "agent";
			position: { x: number; y: number };
			relevantAgent: {
				agentId: number;
				agentName: string;
				blueprintId: number;
				inputPorts: Port[];
			};
	  };
export const useAddNodeAction = () => {
	const reactFlowInstance = useReactFlow();
	const { blueprint, mutate, createTemporaryId } = useBlueprint();
	// const nodeClasses = useNodeClasses();
	const addNodeAction = useCallback(
		async ({ nodeClass, position, relevantAgent }: AddNodeArgs) => {
			invariant(reactFlowInstance != null, "reactFlowInstance is null");
			// reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
			// and you don't need to subtract the reactFlowBounds.left/top anymore
			// details: https://reactflow.dev/whats-new/2023-11-10
			const flowPosition = reactFlowInstance.screenToFlowPosition({
				x: position.x,
				y: position.y,
			});
			const nodeId = createTemporaryId();
			// if (nodeClassName === "agent") {
			// 	mutate({
			// 		type: "addNode",
			// 		optimisticData: {
			// 			node: {
			// 				id: nodeId,
			// 				isCreating: true,
			// 				position: {
			// 					x: flowPosition.x,
			// 					y: flowPosition.y,
			// 				},
			// 				className: nodeClassName,
			// 				properties: [
			// 					...(nodeClass.properties ?? []),
			// 					{
			// 						name: "relevantAgent",
			// 						value: relevantAgent.agentName,
			// 					},
			// 				],
			// 				propertyPortMap: nodeClass.propertyPortMap ?? {},
			// 				inputPorts: [
			// 					...(nodeClass?.inputPorts ?? []),
			// 					...relevantAgent.inputPorts,
			// 				].map(({ type, label, key }, index) => ({
			// 					id: createTemporaryId(),
			// 					nodeId,
			// 					type: type,
			// 					name: label ?? "",
			// 					direction: "input",
			// 					order: index,
			// 					portsBlueprintsId: 0,
			// 					nodeClassKey: key,
			// 				})),
			// 				outputPorts: (nodeClass.outputPorts ?? []).map(
			// 					({ type, label, key }, index) => ({
			// 						id: createTemporaryId(),
			// 						nodeId,
			// 						type: type,
			// 						name: label ?? "",
			// 						direction: "output",
			// 						order: index,
			// 						portsBlueprintsId: 0,
			// 						nodeClassKey: key,
			// 					}),
			// 				),
			// 			},
			// 		},
			// 		action: () =>
			// 			addAgentNode({
			// 				blueprintId: blueprint.id,
			// 				node: {
			// 					className: nodeClassName,
			// 					position: { x: flowPosition.x, y: flowPosition.y },
			// 					relevantAgent: {
			// 						id: relevantAgent.agentId,
			// 						blueprintId: relevantAgent.blueprintId,
			// 					},
			// 				},
			// 			}),
			// 	});
			// } else {
			mutate({
				type: "addNode",
				optimisticData: {
					node: {
						id: nodeId,
						isCreating: true,
						position: {
							x: flowPosition.x,
							y: flowPosition.y,
						},
						className: nodeClass.name,
						properties: nodeClass.template.properties ?? [],
						inputPorts: (nodeClass.template.inputPorts ?? []).map(
							({ type, label, key }, index) => ({
								id: createTemporaryId(),
								nodeId,
								type: type,
								name: label ?? "",
								direction: "input",
								order: index,
								portsBlueprintsId: 0,
								nodeClassKey: key,
							}),
						),
						outputPorts: (nodeClass.template.outputPorts ?? []).map(
							({ type, label, key }, index) => ({
								id: createTemporaryId(),
								nodeId,
								type: type,
								name: label ?? "",
								direction: "output",
								order: index,
								portsBlueprintsId: 0,
								nodeClassKey: key,
							}),
						),
					},
				},
				action: () =>
					addNode({
						blueprintId: blueprint.id,
						node: {
							className: nodeClass.name,
							position: { x: flowPosition.x, y: flowPosition.y },
						},
					}),
			});
			// }
		},
		[reactFlowInstance, mutate, blueprint.id, createTemporaryId],
	);
	return { addNodeAction };
};
