"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
	useOptimistic,
} from "react";
import type { Blueprint } from "..";

const BlueprintContextInternal = createContext<Blueprint | null>(null);
const BlueprintOptimisticActionContextInternal = createContext<
	((newBlueprint: Blueprint) => void) | null
>(null);

type BlueprintProviderProps = {
	blueprint: Blueprint;
};
export const BlueprintProvider: FC<
	PropsWithChildren<BlueprintProviderProps>
> = ({ blueprint, children }) => {
	const [optimisticBlueprint, SetOptimisticBlueprint] = useOptimistic<
		Blueprint,
		Blueprint
	>(blueprint, (state, newBlueprint) => ({
		...state,
		newBlueprint,
	}));
	return (
		<BlueprintOptimisticActionContextInternal.Provider
			value={SetOptimisticBlueprint}
		>
			<BlueprintContextInternal.Provider value={optimisticBlueprint}>
				{children}
			</BlueprintContextInternal.Provider>
		</BlueprintOptimisticActionContextInternal.Provider>
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
