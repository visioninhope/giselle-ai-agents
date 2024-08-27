import type { GiselleNodeData, Port } from "@/app/nodes";
import type { Node } from "@xyflow/react";

export type PlaygroundNode = Node<GiselleNodeData>;

export const playgroundPortDirection = {
	source: "source",
	target: "target",
} as const;
type PlaygroundPortDirection = keyof typeof playgroundPortDirection;
export type PlaygroundPort = Port & {
	direction: PlaygroundPortDirection;
	order: number;
};

export type PlaygroundEdge = {
	id: `ed_${string}`;
	sourcePortId: PlaygroundPort["id"];
	targetPortId: PlaygroundPort["id"];
};

export type PlaygroundGraph = {
	nodes: PlaygroundNode[];
	edges: PlaygroundEdge[];
};
