import {
	type NodeType,
	findNodeDef,
	getNodeDef,
	useNodeDefs,
} from "@/app/node-defs";
import { useCallback, useMemo } from "react";
import type { Edge, Node } from "reactflow";
import invariant from "tiny-invariant";
import { NodeTypes } from "../node";
import { useAgent } from "../use-agent";
import { useBlueprint } from "../use-blueprint";
import { createDraftNode, execApi } from "./nodes/add-node";

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};
type AddNodeArgs = {
	nodeType: NodeType;
	position: { x: number; y: number };
};
type DeleteNodesArgs = number[];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const useEditor = () => {
	const { mutateBlueprint, blueprint } = useBlueprint();
	const { runningAgent } = useAgent();
	const { nodeDefs } = useNodeDefs();
	const editorState = useMemo<EditorState>(() => {
		if (blueprint == null) {
			return { nodes: [], edges: [] };
		}
		const nodes = blueprint.nodes.map((node) => {
			const relevantProcess = runningAgent?.latestRun?.processes.find(
				(process) => process.node.id === node.id,
			);
			return {
				id: `${node.id}`,
				type: NodeTypes.V3,
				position: node.position,
				data: {
					id: `${node.id}`,
					nodeType: node.type,
					runStatus: relevantProcess?.run.status,
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
		return { nodes, edges };
	}, [blueprint, runningAgent]);

	const addNode = useCallback(
		({ nodeType, position }: AddNodeArgs) => {
			if (blueprint == null) {
				return;
			}
			if (nodeDefs == null) {
				return;
			}
			const nodeDef = findNodeDef(nodeDefs, nodeType);
			const draftNode = createDraftNode({
				id: blueprint.nodes.length + 1,
				nodeType,
				nodeDef,
				position,
			});
			mutateBlueprint(
				(prev) =>
					execApi(blueprint, draftNode).then(({ node }) => {
						invariant(prev != null, "invalid state: blueprint is null");
						return {
							blueprint: {
								...prev.blueprint,
								nodes: [...prev.blueprint.nodes, node],
							},
						};
					}),
				{
					optimisticData: (prev) => {
						invariant(prev != null, "invalid state: blueprint is null");
						return {
							blueprint: {
								...prev.blueprint,
								nodes: [...prev.blueprint.nodes, draftNode],
							},
						};
					},
				},
			);
		},
		[blueprint, mutateBlueprint, nodeDefs],
	);

	const deleteNodes = useCallback(
		(deleteNodeIds: DeleteNodesArgs) => {
			if (blueprint == null) {
				return;
			}
			mutateBlueprint(
				sleep(2000).then(() => ({
					blueprint,
				})),
				{
					optimisticData: (prev) => {
						if (prev == null) {
							return { blueprint };
						}
						return {
							blueprint: {
								...prev.blueprint,
								nodes: prev.blueprint.nodes.filter(
									(node) => !deleteNodeIds.includes(node.id),
								),
							},
						};
					},
				},
			);
		},
		[blueprint, mutateBlueprint],
	);

	return {
		editorState,
		addNode,
		deleteNodes,
	};
};
