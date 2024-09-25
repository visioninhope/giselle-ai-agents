import type { Node, NodeProps, NodeTypes } from "@xyflow/react";
import type { FC } from "react";
import {
	archetypes,
	type promptBlueprint,
	type textGeneratorBlueprint,
} from "../giselle-node/blueprints";
import { GiselleNode } from "../giselle-node/components";
import type {
	GiselleNodeObject,
	InferGiselleNodeObject,
} from "../giselle-node/types";

export type ReactFlowNode = Node<GiselleNodeObject>;

export const ReactFlowNode: FC<NodeProps<ReactFlowNode>> = ({ data }) => {
	return <GiselleNode {...data} />;
};

export const giselleNodeType = "giselleNode";
export const nodeTypes: NodeTypes = {
	[giselleNodeType]: ReactFlowNode,
};
