import type { Viewport, XYPosition } from "@xyflow/react";
import type { Node, NodeGraph, Port } from "../nodes";

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
