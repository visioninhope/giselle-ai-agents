import { createConnectorId } from "../connector/factory";
import type { Connector } from "../connector/types";
import { createGiselleNodeId } from "../giselle-node/factory";
import {
	createObjectParameter,
	createStringParameter,
} from "../giselle-node/parameter/factory";
import type {
	ObjectParameter,
	StringParameter,
} from "../giselle-node/parameter/types";
import type {
	GiselleNodeBlueprint,
	GiselleNodeCategory,
	GiselleNodeId,
	GiselleNodeObject,
	XYPosition,
} from "../giselle-node/types";
import type { ThunkAction } from "./context";

export type AddNodeAction = {
	type: "addNode";
	payload: {
		node: GiselleNodeObject;
	};
};

type AddNodeArgs = {
	node: GiselleNodeBlueprint;
	position: XYPosition;
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
				category: args.node.category,
				id: createGiselleNodeId(),
				archetype: args.node.archetype,
				resultPortLabel: args.node.resultPortLabel,
				parameters,
				ui: { position: args.position },
			},
		},
	};
};

export type AddConnectorAction = {
	type: "addConnector";
	payload: {
		connector: Connector;
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
	sourceNode: AddNodeArgs;
	targetNode: AddNodeArgs;
	connector: {
		targetParameterName: string;
	};
};
export const addNodesAndConnect = (
	args: AddNodesAndConnectArgs,
): ThunkAction => {
	return (dispatch, getState) => {
		const addSourceNode = addNode(args.sourceNode);
		dispatch(addSourceNode);
		const addTargetNode = addNode(args.targetNode);
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

export type GraphAction = AddNodeAction | AddConnectorAction | SelectNodeAction;
