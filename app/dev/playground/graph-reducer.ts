import type { Node, Port } from "@/app/nodes";
import type { PlaygroundEdge, PlaygroundGraph, PlaygroundNode } from "./types";

export type GraphAction =
	| { type: "ADD_NODE"; node: PlaygroundNode }
	| { type: "REMOVE_NODE"; nodeId: PlaygroundNode["id"] }
	| {
			type: "UPDATE_NODE";
			nodeId: PlaygroundNode["id"];
			updates: Partial<Pick<Node, "data" | "name">>;
	  }
	| { type: "ADD_PORT"; port: Port }
	| { type: "REMOVE_PORT"; portId: Port["id"] }
	| { type: "UPDATE_PORT"; portId: Port["id"]; updates: Partial<Port> }
	| { type: "ADD_EDGE"; edge: PlaygroundEdge }
	| { type: "REMOVE_EDGE"; edgeId: PlaygroundEdge["id"] }
	| { type: "SET_GRAPH"; graph: PlaygroundGraph };

export function graphReducer(
	state: PlaygroundGraph,
	action: GraphAction,
): PlaygroundGraph {
	switch (action.type) {
		case "ADD_NODE":
			return {
				...state,
				nodes: [...state.nodes, { ...action.node }],
			};
		case "REMOVE_NODE":
			return {
				...state,
				nodes: state.nodes.filter((node) => node.id !== action.nodeId),
			};
		case "UPDATE_NODE":
			return {
				...state,
				nodes: state.nodes.map((node) => {
					if (node.id !== action.nodeId) {
						return node;
					}
					return {
						...node,
						...action.updates,
					};
				}),
			};
		case "ADD_PORT":
			return {
				...state,
				nodes: state.nodes.map((node) => {
					if (node.id !== action.port.nodeId) {
						return node;
					}
					return {
						...node,
						ports: [...node.ports, action.port],
					};
				}),
			};
		case "REMOVE_PORT":
			return {
				...state,
				nodes: state.nodes.map((node) => ({
					...node,
					ports: node.ports.filter((port) => port.id !== action.portId),
				})),
				edges: state.edges.filter(
					(edge) =>
						edge.sourcePortId !== action.portId &&
						edge.targetPortId !== action.portId,
				),
			};
		case "UPDATE_PORT":
			return {
				...state,
				nodes: state.nodes.map((node) => ({
					...node,
					ports: node.ports.map((port) =>
						port.id === action.portId ? { ...port, ...action.updates } : port,
					),
				})),
			};
		case "ADD_EDGE":
			return {
				...state,
				edges: [...state.edges, action.edge],
			};
		case "REMOVE_EDGE":
			return {
				...state,
				edges: state.edges.filter((edge) => edge.id !== action.edgeId),
			};
		case "SET_GRAPH":
			return action.graph;
		default:
			return state;
	}
}
