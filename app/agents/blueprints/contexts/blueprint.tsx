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
				nodeId: number | string;
				position: { x: number; y: number };
			}>;
	  }
	| {
			type: "deleteNodes";
			deltedNodes: Array<{
				nodeId: number | string;
			}>;
	  }
	| {
			type: "connectNodes";
			edge: Edge;
	  }
	| {
			type: "deleteEdges";
			deletedEdges: Array<{ edgeId: number }>;
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
