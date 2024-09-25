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
	GiselleNodeObject,
	XYPosition,
} from "../giselle-node/types";

export type AddNodeAction = {
	type: "addNode";
	payload: {
		node: GiselleNodeObject;
	};
};

export const addNode = (
	node: GiselleNodeBlueprint,
	position: XYPosition,
): AddNodeAction => {
	let parameters: ObjectParameter | StringParameter | undefined;
	if (node.parameters?.type === "object") {
		parameters = createObjectParameter(node.parameters);
	} else if (node.parameters?.type === "string") {
		parameters = createStringParameter(node.parameters);
	}
	return {
		type: "addNode",
		payload: {
			node: {
				object: "node",
				id: createGiselleNodeId(),
				archetype: node.archetype,
				parameters,
				ui: { position },
			},
		},
	};
};

export type GraphAction = AddNodeAction;
