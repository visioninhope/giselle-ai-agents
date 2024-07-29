import {
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useOptimistic,
	useReducer,
	useTransition,
} from "react";
import { match } from "ts-pattern";
import {
	type Blueprint,
	type BlueprintPort,
	type Edge,
	type Node,
	reviewRequiredActions,
} from "..";

type AddNode = { type: "addNode"; node: Node };
type UpdateNodesPosition = {
	type: "updateNodesPosition";
	nodes: Array<{
		nodeId: string;
		position: { x: number; y: number };
	}>;
};
type BlueprintAction =
	| { type: "addNode"; node: Node }
	| {
			type: "updateNodesPosition";
			nodes: Array<{
				nodeId: string;
				position: { x: number; y: number };
			}>;
	  }
	| {
			type: "deleteNodes";
			deleteNodeIds: Array<string>;
	  }
	| {
			type: "connectNodes";
			edge: Edge;
	  }
	| {
			type: "deleteEdges";
			deleteEdgeIds: Array<number>;
	  }
	| {
			type: "updateNodeProperty";
			node: {
				id: string;
				property: {
					name: string;
					value: string;
				};
			};
	  }
	| {
			type: "addNodePort";
			port: BlueprintPort;
	  }
	| {
			type: "updatePortName";
			portId: string;
			name: string;
	  }
	| {
			type: "deletePort";
			deletePortId: string;
	  };

type BlueprintActionType = BlueprintAction["type"];
type BlueprintActionPayload<T> = T extends BlueprintActionType
	? Omit<Extract<BlueprintAction, { type: T }>, "type">
	: never;

type MutateBlueprintArgs<
	T extends BlueprintActionType,
	D extends BlueprintActionPayload<T>,
> = {
	type: T;
	action: (optimisticData: D) => Promise<BlueprintActionPayload<T>>;
	optimisticData: D;
};

const BlueprintContext = createContext<{
	blueprint: Blueprint;
	mutate: <T extends BlueprintActionType, D extends BlueprintActionPayload<T>>(
		args: MutateBlueprintArgs<T, D>,
	) => void;
	isPending: boolean;
} | null>(null);

const reducer = (state: Blueprint, action: BlueprintAction) =>
	match(action)
		.with({ type: "addNode" }, ({ node }) => ({
			...state,
			nodes: [...state.nodes, node],
		}))
		.with({ type: "updateNodesPosition" }, ({ nodes }) => ({
			...state,
			nodes: state.nodes.map((stateNode) => {
				const node = nodes.find(
					({ nodeId }) => `${nodeId}` === `${stateNode.id}`,
				);
				return node
					? {
							...stateNode,
							position: node.position,
						}
					: stateNode;
			}),
		}))
		.with({ type: "deleteNodes" }, ({ deleteNodeIds }) => ({
			...state,
			nodes: state.nodes.filter(
				(node) =>
					!deleteNodeIds.some((deletedNodeId) => deletedNodeId === node.id),
			),
		}))
		.with({ type: "connectNodes" }, ({ edge }) => ({
			...state,
			edges: [...state.edges, edge],
			requiredActions: reviewRequiredActions({
				...state,
				edges: [...state.edges, edge],
			}),
		}))
		.with({ type: "deleteEdges" }, ({ deleteEdgeIds }) => ({
			...state,
			edges: state.edges.filter(
				(edge) =>
					!deleteEdgeIds.some(
						(deleteEdgeId) => `${deleteEdgeId}` === `${edge.id}`,
					),
			),
			requiredActions: reviewRequiredActions({
				...state,
				edges: state.edges.filter(
					(edge) =>
						!deleteEdgeIds.some(
							(deleteEdgeId) => `${deleteEdgeId}` === `${edge.id}`,
						),
				),
			}),
		}))
		.with({ type: "updateNodeProperty" }, ({ node }) => ({
			...state,
			nodes: state.nodes.map((stateNode) =>
				stateNode.id === node.id
					? {
							...stateNode,
							properties: stateNode.properties.map((property) =>
								property.name === node.property.name
									? { ...property, value: node.property.value }
									: property,
							),
						}
					: stateNode,
			),
		}))
		.with({ type: "addNodePort" }, ({ port }) => ({
			...state,
			nodes: state.nodes.map((stateNode) => {
				if (stateNode.id !== port.nodeId) {
					return stateNode;
				}

				if (port.direction === "input") {
					return {
						...stateNode,
						inputPorts: [...stateNode.inputPorts, port],
					};
				}
				if (port.direction === "output") {
					return {
						...stateNode,
						outputPorts: [...stateNode.outputPorts, port],
					};
				}
				throw new Error(`Unexpected port direction: ${port.direction}`);
			}),
		}))
		.with({ type: "updatePortName" }, ({ portId, name }) => ({
			...state,
			nodes: state.nodes.map((stateNode) => {
				const port = stateNode.inputPorts.find(({ id }) => id === portId);
				if (port) {
					return {
						...stateNode,
						inputPorts: stateNode.inputPorts.map((inputPort) =>
							inputPort.id === portId ? { ...inputPort, name } : inputPort,
						),
					};
				}
				const outputPort = stateNode.outputPorts.find(
					({ id }) => id === portId,
				);
				if (outputPort) {
					return {
						...stateNode,
						outputPorts: stateNode.outputPorts.map((outputPort) =>
							outputPort.id === portId ? { ...outputPort, name } : outputPort,
						),
					};
				}
				return stateNode;
			}),
		}))
		.with({ type: "deletePort" }, ({ deletePortId }) => ({
			...state,
			nodes: state.nodes.map((stateNode) => {
				const inputPort = stateNode.inputPorts.find(
					({ id }) => id === deletePortId,
				);
				if (inputPort) {
					return {
						...stateNode,
						inputPorts: stateNode.inputPorts.filter(
							({ id }) => id !== deletePortId,
						),
					};
				}
				const outputPort = stateNode.outputPorts.find(
					({ id }) => id === deletePortId,
				);
				if (outputPort) {
					return {
						...stateNode,
						outputPorts: stateNode.outputPorts.filter(
							({ id }) => id !== deletePortId,
						),
					};
				}
				return stateNode;
			}),
		}))
		.exhaustive();

type BlueprintProviderProps = {
	blueprint: Blueprint;
};

export const BlueprintProvider: React.FC<
	PropsWithChildren<BlueprintProviderProps>
> = ({ blueprint: defaultBlueprint, children }) => {
	const [isPending, startTransition] = useTransition();
	const [blueprint, dispatch] = useReducer(reducer, defaultBlueprint);
	const [optimisticBlueprint, setOptimisticBlueprint] = useOptimistic<
		Blueprint,
		BlueprintAction
	>(blueprint, reducer);
	const mutate = useCallback(
		<T extends BlueprintActionType, D extends BlueprintActionPayload<T>>(
			args: MutateBlueprintArgs<T, D>,
		) => {
			startTransition(async () => {
				const { type, action, optimisticData } = args;
				/** @todo remove type assertion */
				setOptimisticBlueprint({ ...optimisticData, type } as BlueprintAction);
				const result = await action(optimisticData);
				/** @todo remove type assertion */
				dispatch({ ...optimisticData, ...result, type } as BlueprintAction);
			});
		},
		[setOptimisticBlueprint],
	);
	return (
		<BlueprintContext.Provider value={{ blueprint, mutate, isPending }}>
			{children}
		</BlueprintContext.Provider>
	);
};

export const useBlueprint = () => {
	const context = useContext(BlueprintContext);
	if (!context) {
		throw new Error("useAgent must be used within an AgentProvider");
	}
	return context;
};
