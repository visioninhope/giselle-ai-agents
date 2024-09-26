import type { GraphAction } from "./actions";
import type { GraphState } from "./types";

export const graphReducer = (
	state: GraphState,
	action: GraphAction,
): GraphState => {
	switch (action.type) {
		case "addNode":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: [...state.graph.nodes, action.payload.node],
				},
			};
		case "addConnector":
			return {
				...state,
				graph: {
					...state.graph,
					connectors: [...state.graph.connectors, action.payload.connector],
				},
			};
		case "selectNode":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: state.graph.nodes.map((node) => ({
						...node,
						ui: {
							...node.ui,
							selected: action.payload.selectedNodeIds.includes(node.id),
						},
					})),
				},
			};
		case "setPanelTab":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: state.graph.nodes.map((node) => ({
						...node,
						ui: {
							...node.ui,
							panelTab:
								node.id === action.payload.node.id
									? action.payload.node.panelTab
									: node.ui.panelTab,
						},
					})),
				},
			};
		case "updateNodesPosition":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: state.graph.nodes.map((currentNode) => {
						const updateNode = action.payload.nodes.find(
							(payloadNode) => payloadNode.id === currentNode.id,
						);
						if (updateNode == null) {
							return currentNode;
						}
						return {
							...currentNode,
							ui: {
								...currentNode.ui,
								position: updateNode.position,
							},
						};
					}),
				},
			};

		default:
			return state;
	}
};
