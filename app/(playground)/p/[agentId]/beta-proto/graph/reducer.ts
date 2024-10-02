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

		case "updateNodeProperties":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: state.graph.nodes.map((node) => {
						if (action.payload.node.id !== node.id) {
							return node;
						}
						return {
							...node,
							properties: {
								...node.properties,
								[action.payload.node.property.key]:
									action.payload.node.property.value,
							},
						};
					}),
				},
			};
		case "updateNodesUI":
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
								...updateNode.ui,
							},
						};
					}),
				},
			};
		case "updateNodeState":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: state.graph.nodes.map((node) => ({
						...node,
						state:
							node.id === action.payload.node.id
								? action.payload.node.state
								: node.state,
					})),
				},
			};

		case "setNodeOutput":
		case "setTextGenerationNodeOutput":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: state.graph.nodes.map((node) =>
						node.id !== action.payload.node.id
							? node
							: {
									...node,
									output: action.payload.node.output,
								},
					),
				},
			};
		case "addOrReplaceArtifact": {
			const replace = state.graph.artifacts.some(
				(artifact) => artifact.id === action.payload.artifact.id,
			);
			if (replace) {
				return {
					...state,
					graph: {
						...state.graph,
						artifacts: [
							...state.graph.artifacts.filter(
								(artifact) => artifact.id !== action.payload.artifact.id,
							),
							action.payload.artifact,
						],
					},
				};
			}
			return {
				...state,
				graph: {
					...state.graph,
					artifacts: [...state.graph.artifacts, action.payload.artifact],
				},
			};
		}
		case "addParameterToNode":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: state.graph.nodes.map((node) =>
						node.id !== action.payload.node.id
							? node
							: {
									...node,
									parameters:
										node.parameters?.object === "objectParameter"
											? {
													...node.parameters,
													properties: {
														...node.parameters.properties,
														[action.payload.parameter.key]:
															action.payload.parameter.value,
													},
												}
											: node.parameters,
								},
					),
				},
			};
		default:
			return state;
	}
};
