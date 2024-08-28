import type { Node, NodeGraph, Port } from "@/app/nodes";
import type { Viewport, XYPosition } from "@xyflow/react";

export type PlaygroundNode = NodeGraph & { position: XYPosition };

export type PlaygroundEdge = {
	id: `ed_${string}`;
	sourceNodeId: Node["id"];
	sourcePortId: Port["id"];
	targetNodeId: Node["id"];
	targetPortId: Port["id"];
};

export type PlaygroundViewport = Viewport;
export type PlaygroundGraph = {
	nodes: PlaygroundNode[];
	edges: PlaygroundEdge[];
	viewport: PlaygroundViewport;
};
