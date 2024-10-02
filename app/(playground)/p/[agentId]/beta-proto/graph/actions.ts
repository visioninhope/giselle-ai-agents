import { readStreamableValue } from "ai/rsc";
import { createArtifactId } from "../artifact/factory";
import type { Artifact } from "../artifact/types";
import type {
	GeneratedObject,
	PartialGeneratedObject,
} from "../artifact/types";
import { createConnectorId } from "../connector/factory";
import type { ConnectorObject } from "../connector/types";
import { textGeneratorParameterNames } from "../giselle-node/blueprints";
import { createGiselleNodeId } from "../giselle-node/factory";
import {
	createObjectParameter,
	createStringParameter,
} from "../giselle-node/parameter/factory";
import type {
	ObjectParameter,
	StringParameter,
} from "../giselle-node/parameter/types";
import {
	type GiselleNode,
	type GiselleNodeBlueprint,
	type GiselleNodeCategory,
	type GiselleNodeId,
	type GiselleNodeState,
	type PanelTab,
	type XYPosition,
	giselleNodeState,
} from "../giselle-node/types";
import { giselleNodeToGiselleNodeArtifactElement } from "../giselle-node/utils";
import type { ThunkAction } from "./context";
import { generateObjectStream } from "./server-actions";

export type AddNodeAction = {
	type: "addNode";
	payload: {
		node: GiselleNode;
	};
};

type AddNodeArgs = {
	node: GiselleNodeBlueprint;
	position: XYPosition;
	name: string;
	properties?: Record<string, unknown>;
};

export const addNode = (args: AddNodeArgs): AddNodeAction => {
	let parameters: ObjectParameter | StringParameter | undefined;
	if (args.node.parameters?.type === "object") {
		parameters = createObjectParameter(args.node.parameters);
	} else if (args.node.parameters?.type === "string") {
		parameters = createStringParameter(args.node.parameters);
	}
	return {
		type: "addNode",
		payload: {
			node: {
				object: "node",
				name: args.name,
				category: args.node.category,
				id: createGiselleNodeId(),
				archetype: args.node.archetype,
				resultPortLabel: args.node.resultPortLabel,
				parameters,
				ui: { position: args.position },
				properties: args.properties ?? {},
				state: giselleNodeState.idle,
				output: "",
			},
		},
	};
};

export type AddConnectorAction = {
	type: "addConnector";
	payload: {
		connector: ConnectorObject;
	};
};

type AddConnectorArgs = {
	sourceNode: {
		id: GiselleNodeId;
		category: GiselleNodeCategory;
	};
	targetNode: {
		id: GiselleNodeId;
		handle: string;
		category: GiselleNodeCategory;
	};
};
export const addConnector = (args: AddConnectorArgs): AddConnectorAction => {
	return {
		type: "addConnector",
		payload: {
			connector: {
				id: createConnectorId(),
				object: "connector",
				source: args.sourceNode.id,
				sourceNodeCategory: args.sourceNode.category,
				target: args.targetNode.id,
				targetHandle: args.targetNode.handle,
				targetNodeCategory: args.targetNode.category,
			},
		},
	};
};

type AddNodesAndConnectArgs = {
	sourceNode: Omit<AddNodeArgs, "name">;
	targetNode: Omit<AddNodeArgs, "name">;
	connector: {
		targetParameterName: string;
	};
};
export const addNodesAndConnect = (
	args: AddNodesAndConnectArgs,
): ThunkAction => {
	return (dispatch, getState) => {
		const currentNodes = getState().graph.nodes;
		const addSourceNode = addNode({
			...args.sourceNode,
			name: `Untitled node - ${currentNodes.length + 1}`,
		});
		dispatch(addSourceNode);
		const addTargetNode = addNode({
			...args.targetNode,
			name: `Untitled node - ${currentNodes.length + 2}`,
		});
		dispatch(addTargetNode);
		dispatch(
			addConnector({
				sourceNode: {
					id: addSourceNode.payload.node.id,
					category: args.sourceNode.node.category,
				},
				targetNode: {
					id: addTargetNode.payload.node.id,
					handle: args.connector.targetParameterName,
					category: args.targetNode.node.category,
				},
			}),
		);
	};
};

type SelectNodeAction = {
	type: "selectNode";
	payload: {
		selectedNodeIds: GiselleNodeId[];
	};
};

type SelectNodeArgs = {
	selectedNodeIds: GiselleNodeId[];
};
export const selectNode = (args: SelectNodeArgs): SelectNodeAction => {
	return {
		type: "selectNode",
		payload: {
			selectedNodeIds: args.selectedNodeIds,
		},
	};
};

type SetPanelTabAction = {
	type: "setPanelTab";
	payload: {
		node: {
			id: GiselleNodeId;
			panelTab: PanelTab;
		};
	};
};
type SetPanelTabArgs = {
	node: {
		id: GiselleNodeId;
		panelTab: PanelTab;
	};
};
export const setPanelTab = (args: SetPanelTabArgs): SetPanelTabAction => {
	return {
		type: "setPanelTab",
		payload: {
			node: args.node,
		},
	};
};

export const selectNodeAndSetPanelTab = (args: {
	selectNode: {
		id: GiselleNodeId;
		panelTab: PanelTab;
	};
}): ThunkAction => {
	return (dispatch) => {
		dispatch(
			selectNode({
				selectedNodeIds: [args.selectNode.id],
			}),
		);
		dispatch(
			setPanelTab({
				node: {
					id: args.selectNode.id,
					panelTab: args.selectNode.panelTab,
				},
			}),
		);
	};
};

type UpdateNodePropertyAction = {
	type: "updateNodeProperties";
	payload: {
		node: {
			id: GiselleNodeId;
			property: {
				key: string;
				value: unknown;
			};
		};
	};
};

type UpdateNodePropertyArgs = {
	node: {
		id: GiselleNodeId;
		property: {
			key: string;
			value: unknown;
		};
	};
};

export const updateNodeProperty = (
	args: UpdateNodePropertyArgs,
): UpdateNodePropertyAction => {
	return {
		type: "updateNodeProperties",
		payload: {
			node: args.node,
		},
	};
};

type UpdateNodesUIAction = {
	type: "updateNodesUI";
	payload: {
		nodes: Array<{
			id: GiselleNodeId;
			ui: Partial<GiselleNode["ui"]>;
		}>;
	};
};

type UpdateNodesUIArgs = {
	nodes: Array<{
		id: GiselleNodeId;
		ui: Partial<GiselleNode["ui"]>;
	}>;
};

export const updateNodesUI = (args: UpdateNodesUIArgs): UpdateNodesUIAction => {
	return {
		type: "updateNodesUI",
		payload: {
			nodes: args.nodes,
		},
	};
};

type SetNodeOutputAction = {
	type: "setNodeOutput";
	payload: {
		node: {
			id: GiselleNodeId;
			// biome-ignore lint: lint/suspicious/noExplicitAny
			output: any;
		};
	};
};

type SetNodeOutputArgs = {
	node: {
		id: GiselleNodeId;
		// biome-ignore lint: lint/suspicious/noExplicitAny
		output: any;
	};
};
export const setNodeOutput = (args: SetNodeOutputArgs): SetNodeOutputAction => {
	return {
		type: "setNodeOutput",
		payload: {
			node: args.node,
		},
	};
};

type SetTextGenerationNodeOutputAction = {
	type: "setTextGenerationNodeOutput";
	payload: {
		node: {
			id: GiselleNodeId;
			output: PartialGeneratedObject;
		};
	};
};

type SetTextGenerationNodeOutputArgs = {
	node: {
		id: GiselleNodeId;
		output: PartialGeneratedObject;
	};
};
const setTextGenerationNodeOutput = (
	args: SetTextGenerationNodeOutputArgs,
): SetTextGenerationNodeOutputAction => {
	return {
		type: "setTextGenerationNodeOutput",
		payload: args,
	};
};

type UpdateNodeStateAction = {
	type: "updateNodeState";
	payload: {
		node: {
			id: GiselleNodeId;
			state: GiselleNodeState;
		};
	};
};
type UpdateNodeStateArgs = {
	node: {
		id: GiselleNodeId;
		state: GiselleNodeState;
	};
};
export const updateNodeState = (
	args: UpdateNodeStateArgs,
): UpdateNodeStateAction => {
	return {
		type: "updateNodeState",
		payload: {
			node: args.node,
		},
	};
};

type AddOrReplaceArtifactAction = {
	type: "addOrReplaceArtifact";
	payload: AddOrReplaceArtifactArgs;
};

type AddOrReplaceArtifactArgs = {
	artifact: Artifact;
};

export const addOrReplaceArtifact = (
	args: AddOrReplaceArtifactArgs,
): AddOrReplaceArtifactAction => {
	return {
		type: "addOrReplaceArtifact",
		payload: args,
	};
};

type GenerateTextArgs = {
	textGeneratorNode: {
		id: GiselleNodeId;
	};
};

export const generateText =
	(args: GenerateTextArgs): ThunkAction =>
	async (dispatch, getState) => {
		dispatch(
			setNodeOutput({
				node: {
					id: args.textGeneratorNode.id,
					output: "",
				},
			}),
		);
		dispatch(
			updateNodeState({
				node: {
					id: args.textGeneratorNode.id,
					state: giselleNodeState.inProgress,
				},
			}),
		);
		const state = getState();
		const instructionConnector = state.graph.connectors.find(
			(connector) =>
				connector.target === args.textGeneratorNode.id &&
				connector.targetHandle === textGeneratorParameterNames.instruction,
		);
		const instructionNode = state.graph.nodes.find(
			(node) => node.id === instructionConnector?.source,
		);
		if (instructionNode === undefined) {
			/** @todo error handling  */
			throw new Error("Instruction node not found");
		}

		const { object } = await generateObjectStream(
			instructionNode.output as string,
		);
		let content: PartialGeneratedObject = {};
		for await (const streamContent of readStreamableValue(object)) {
			dispatch(
				setTextGenerationNodeOutput({
					node: {
						id: args.textGeneratorNode.id,
						output:
							streamContent as PartialGeneratedObject /** @todo type assertion */,
					},
				}),
			);
			content = streamContent as PartialGeneratedObject;
		}
		const artifact = state.graph.artifacts.find(
			(artifact) => artifact.generatorNode.id === args.textGeneratorNode.id,
		);
		const node = state.graph.nodes.find(
			(node) => node.id === args.textGeneratorNode.id,
		);
		if (node === undefined) {
			/** @todo error handling  */
			throw new Error("Node not found");
		}

		dispatch(
			addOrReplaceArtifact({
				artifact: {
					id: artifact === undefined ? createArtifactId() : artifact.id,
					type: "artifact",
					title: content?.artifact?.title ?? "",
					content: content?.artifact?.content ?? "",
					generatorNode: {
						id: node.id,
						category: node.category,
						archetype: node.archetype,
						name: node.name,
						object: "node.artifactElement",
						properties: node.properties,
					},
					elements: [giselleNodeToGiselleNodeArtifactElement(instructionNode)],
				},
			}),
		);
		dispatch(
			updateNodeState({
				node: {
					id: args.textGeneratorNode.id,
					state: giselleNodeState.completed,
				},
			}),
		);
	};
export type GraphAction =
	| AddNodeAction
	| AddConnectorAction
	| SelectNodeAction
	| SetPanelTabAction
	| UpdateNodePropertyAction
	| UpdateNodesUIAction
	| SetNodeOutputAction
	| SetTextGenerationNodeOutputAction
	| UpdateNodeStateAction
	| AddOrReplaceArtifactAction;
