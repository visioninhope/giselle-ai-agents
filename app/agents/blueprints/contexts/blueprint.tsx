"use client";

import {
	type FC,
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

const BlueprintContextInternal = createContext<Blueprint | null>(null);
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
			deltedNodes: Array<{
				nodeId: string;
			}>;
	  }
	| {
			type: "connectNodes";
			edge: Edge;
	  }
	| {
			type: "deleteEdges";
			deletedEdges: Array<{ edgeId: number }>;
	  }
	| {
			type: "updateNodeProperty";
			node: {
				nodeId: string;
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

// biome-ignore lint: lint/suspicious/noExplicitAny
type MutateBlueprintArgs<T extends Promise<any>> = {
	optimisticAction: BlueprintAction;
	mutation: T;
	action: (
		result: T extends Promise<infer U> ? Awaited<U> : never,
	) => BlueprintAction;
};

type BlueprintActionContextInternalState = {
	// biome-ignore lint: lint/suspicious/noExplicitAny
	mutateBlueprint: <T extends Promise<any>>(
		args: MutateBlueprintArgs<T>,
	) => void;
	isPending: boolean;
} | null;
const BlueprintActionContextInternal =
	createContext<BlueprintActionContextInternalState>(null);

type BlueprintProviderProps = {
	blueprint: Blueprint;
};

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
		.with({ type: "deleteNodes" }, ({ deltedNodes }) => ({
			...state,
			nodes: state.nodes.filter(
				(node) =>
					!deltedNodes.some(({ nodeId }) => `${nodeId}` === `${node.id}`),
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
		.with({ type: "deleteEdges" }, ({ deletedEdges }) => ({
			...state,
			edges: state.edges.filter(
				(edge) =>
					!deletedEdges.some(({ edgeId }) => `${edgeId}` === `${edge.id}`),
			),
			requiredActions: reviewRequiredActions({
				...state,
				edges: state.edges.filter(
					(edge) =>
						!deletedEdges.some(({ edgeId }) => `${edgeId}` === `${edge.id}`),
				),
			}),
		}))
		.with({ type: "updateNodeProperty" }, ({ node }) => ({
			...state,
			nodes: state.nodes.map((stateNode) =>
				stateNode.id === node.nodeId
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
export const BlueprintProvider: FC<
	PropsWithChildren<BlueprintProviderProps>
> = ({ blueprint: defaultBlueprint, children }) => {
	const [isPending, startTransition] = useTransition();
	const [blueprint, setBlueprint] = useReducer(reducer, defaultBlueprint);

	const [optimisticBlueprint, setOptimisticBlueprintInternal] = useOptimistic<
		Blueprint,
		BlueprintAction
	>(blueprint, reducer);

	const mutateBlueprint = useCallback(
		// biome-ignore lint: lint/suspicious/noExplicitAny
		<T extends Promise<any>>({
			optimisticAction,
			mutation,
			action,
		}: MutateBlueprintArgs<T>) => {
			startTransition(async () => {
				setOptimisticBlueprintInternal(optimisticAction);
				await mutation.then((result) => {
					setBlueprint(action(result));
				});
			});
		},
		[setOptimisticBlueprintInternal],
	);

	return (
		<BlueprintContextInternal.Provider value={optimisticBlueprint}>
			<BlueprintActionContextInternal.Provider
				value={{
					mutateBlueprint,
					isPending,
				}}
			>
				{children}
			</BlueprintActionContextInternal.Provider>
		</BlueprintContextInternal.Provider>
	);
};

export const useBlueprint = () => {
	const blueprint = useContext(BlueprintContextInternal);
	if (blueprint === null) {
		throw new Error("useBlueprint must be used within a BlueprintProvider");
	}
	return blueprint;
};

export const useBlueprintMutation = () => {
	const mutateBlueprint = useContext(BlueprintActionContextInternal);
	if (mutateBlueprint === null) {
		throw new Error(
			"useBlueprintMutation must be used within a BlueprintProvider",
		);
	}
	return mutateBlueprint;
};

export const useNode = (nodeId: string) => {
	const blueprint = useBlueprint();
	return blueprint.nodes.find(({ id }) => id === nodeId);
};
