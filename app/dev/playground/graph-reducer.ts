import {
	type PlaygroundEdge,
	type PlaygroundGraph,
	type PlaygroundNode,
	type PlaygroundNodeGraph,
	type PlaygroundPort,
	playgroundPortDirection,
} from "./types";

export type GraphAction =
	| { type: "ADD_NODE"; node: PlaygroundNodeGraph }
	| { type: "REMOVE_NODE"; nodeId: PlaygroundNode["id"] }
	| { type: "ADD_PORT"; port: PlaygroundPort }
	| { type: "REMOVE_PORT"; portId: PlaygroundPort["id"] }
	| { type: "ADD_EDGE"; edge: PlaygroundEdge }
	| { type: "REMOVE_EDGE"; edgeId: PlaygroundEdge["id"] };

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
				edges: state.edges.filter(
					(edge) =>
						!state.nodes
							.find((node) => node.id === action.nodeId)
							?.sourcePorts.some((port) => port.id === edge.sourcePortId) &&
						!state.nodes
							.find((node) => node.id === action.nodeId)
							?.targetPorts.some((port) => port.id === edge.targetPortId),
				),
			};
		case "ADD_PORT":
			return {
				...state,
				nodes: state.nodes.map((node) =>
					node.id === action.port.nodeId
						? {
								...node,
								sourcePorts:
									action.port.direction === playgroundPortDirection.source
										? [...node.sourcePorts, action.port]
										: node.sourcePorts,
								targetPorts:
									action.port.direction === playgroundPortDirection.target
										? [...node.targetPorts, action.port]
										: node.targetPorts,
							}
						: node,
				),
			};
		case "REMOVE_PORT":
			return {
				...state,
				nodes: state.nodes.map((node) => ({
					...node,
					sourcePorts: node.sourcePorts.filter(
						(port) => port.id !== action.portId,
					),
					targetPorts: node.targetPorts.filter(
						(port) => port.id !== action.portId,
					),
				})),
				edges: state.edges.filter(
					(edge) =>
						edge.sourcePortId !== action.portId &&
						edge.targetPortId !== action.portId,
				),
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
		default:
			return state;
	}
}
