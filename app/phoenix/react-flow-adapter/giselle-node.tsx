import {
	Handle,
	type Node,
	type NodeProps,
	type NodeTypes,
	Position,
	useEdges,
} from "@xyflow/react";
import type { FC } from "react";
import { GiselleNode } from "../giselle-node/components";
import type { GiselleNodeObject } from "../giselle-node/types";

export type ReactFlowNode = Node<GiselleNodeObject>;

export const ReactFlowNode: FC<NodeProps<ReactFlowNode>> = ({ data }) => {
	const edges = useEdges();
	return (
		<GiselleNode
			{...data}
			customTargetHandle={({ key }) => (
				<Handle id={key} type="target" position={Position.Left} />
			)}
			customSourceHandle={({ key }) => (
				<Handle id={key} type="source" position={Position.Right} />
			)}
		/>
	);
};

export const giselleNodeType = "giselleNode";
export const nodeTypes: NodeTypes = {
	[giselleNodeType]: ReactFlowNode,
};
