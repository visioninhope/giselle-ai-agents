import {
	addNode,
	useBlueprint,
	useBlueprintOptimisticAction,
} from "@/app/agents/blueprints";
import {
	type NodeClassName,
	findNodeClass,
	useNodeClasses,
} from "@/app/node-classes";
import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import invariant from "tiny-invariant";

type AddNodeArgs = {
	nodeClassName: NodeClassName;
	position: { x: number; y: number };
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const useAddNodeAction = () => {
	const reactFlowInstance = useReactFlow();
	const blueprint = useBlueprint();
	const nodeClasses = useNodeClasses();
	const { setOptimisticBlueprint } = useBlueprintOptimisticAction();
	const addNodeAction = useCallback(
		async ({ nodeClassName, position }: AddNodeArgs) => {
			invariant(reactFlowInstance != null, "reactFlowInstance is null");
			// reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
			// and you don't need to subtract the reactFlowBounds.left/top anymore
			// details: https://reactflow.dev/whats-new/2023-11-10
			const flowPosition = reactFlowInstance.screenToFlowPosition({
				x: position.x,
				y: position.y,
			});
			const nodeClass = findNodeClass(nodeClasses, nodeClassName);
			setOptimisticBlueprint({
				...blueprint,
				nodes: [
					...blueprint.nodes.map(({ id, ...node }) => ({
						...node,
						id: `${id}`,
					})),
					{
						id: createId(),
						isCreating: true,
						position,
						className: nodeClassName,
						properties: nodeClass.properties ?? [],
						propertyPortMap: nodeClass.propertyPortMap ?? {},
						inputPorts: (nodeClass.inputPorts ?? []).map(
							({ type, label, key }, index) => ({
								id: index,
								nodeId: 0,
								type: type,
								name: label ?? "",
								direction: "input",
								order: index,
								portsBlueprintsId: 0,
								nodeClassKey: key,
							}),
						),
						outputPorts: (nodeClass.outputPorts ?? []).map(
							({ type, label, key }, index) => ({
								id: index,
								nodeId: 0,
								type: type,
								name: label ?? "",
								direction: "output",
								order: index,
								portsBlueprintsId: 0,
								nodeClassKey: key,
							}),
						),
					},
				],
			});
			// await sleep(1000);
			// console.log("sleep!");
			// await addNode({
			// 	blueprintId: blueprint.id,
			// 	node: {
			// 		className: nodeClassName,
			// 		position: { x: flowPosition.x, y: flowPosition.y },
			// 	},
			// });
		},
		[reactFlowInstance, blueprint, setOptimisticBlueprint, nodeClasses],
	);
	return { addNodeAction };
};
