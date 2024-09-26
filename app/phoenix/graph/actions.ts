import { createConnectorId } from "../connector/factory";
import type { ConnectorObject } from "../connector/types";
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
	PanelTab,
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
				category: args.node.category,
				id: createGiselleNodeId(),
				archetype: args.node.archetype,
				resultPortLabel: args.node.resultPortLabel,
				parameters,
				ui: { position: args.position },
				properties: args.properties ?? {},
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
type UpdateNodesPositionAction = {
	type: "updateNodesPosition";
	payload: {
		nodes: Array<{
			id: GiselleNodeId;
			position: XYPosition;
		}>;
	};
};
type UpdateNodesPositionArgs = {
	nodes: Array<{
		id: GiselleNodeId;
		position: XYPosition;
	}>;
};
export const updateNodesPosition = (
	args: UpdateNodesPositionArgs,
): UpdateNodesPositionAction => {
	return {
		type: "updateNodesPosition",
		payload: {
			nodes: args.nodes,
		},
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

export type GraphAction =
	| AddNodeAction
	| AddConnectorAction
	| SelectNodeAction
	| SetPanelTabAction
	| UpdateNodesPositionAction
	| UpdateNodePropertyAction;
