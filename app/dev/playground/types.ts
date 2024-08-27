import type { NodeGraph, Port } from "@/app/nodes";
import type { XYPosition } from "@xyflow/react";

export type PlaygroundNode = NodeGraph & { position: XYPosition };

export type PlaygroundEdge = {
	id: `ed_${string}`;
	sourcePortId: Port["id"];
	targetPortId: Port["id"];
};

export type PlaygroundGraph = {
	nodes: PlaygroundNode[];
	edges: PlaygroundEdge[];
};
