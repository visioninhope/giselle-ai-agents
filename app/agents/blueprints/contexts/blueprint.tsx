"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useOptimistic,
	useTransition,
} from "react";
import type { Blueprint, Node } from "..";

const BlueprintContextInternal = createContext<Blueprint | null>(null);
type BlueprintOptimisticActionContextInternalState = {
	setOptimisticBlueprint: (newBlueprint: OptimisticBlueprint) => void;
	isPending: boolean;
} | null;
const BlueprintOptimisticActionContextInternal =
	createContext<BlueprintOptimisticActionContextInternalState>(null);

type BlueprintProviderProps = {
	blueprint: Blueprint;
};

type OptimisticNode = Omit<Node, "id"> & { isCreating?: boolean; id: string };
type OptimisticBlueprint = Omit<Blueprint, "nodes"> & {
	nodes: OptimisticNode[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const BlueprintProvider: FC<
	PropsWithChildren<BlueprintProviderProps>
> = ({ blueprint, children }) => {
	const [isPending, startTransition] = useTransition();
	const [optimisticBlueprint, setOptimisticBlueprintInternal] = useOptimistic<
		Blueprint,
		OptimisticBlueprint
	>(blueprint, (state, newBlueprint) => ({
		...newBlueprint,
	}));
	const setOptimisticBlueprint = useCallback(
		(newBlueprint: OptimisticBlueprint) => {
			startTransition(async () => {
				setOptimisticBlueprintInternal({ ...newBlueprint });
				await sleep(10000);
			});
		},
		[setOptimisticBlueprintInternal],
	);
	console.log({ optimisticBlueprint, isPending });

	return (
		<BlueprintContextInternal.Provider value={optimisticBlueprint}>
			<BlueprintOptimisticActionContextInternal.Provider
				value={{
					setOptimisticBlueprint,
					isPending,
				}}
			>
				{children}
			</BlueprintOptimisticActionContextInternal.Provider>
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

export const useBlueprintOptimisticAction = () => {
	const setOptimisticBlueprint = useContext(
		BlueprintOptimisticActionContextInternal,
	);
	if (setOptimisticBlueprint === null) {
		throw new Error(
			"useBlueprintOptimisticAction must be used within a BlueprintProvider",
		);
	}
	return setOptimisticBlueprint;
};
