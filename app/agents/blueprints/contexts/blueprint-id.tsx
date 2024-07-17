"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
} from "react";

const BlueprintIdContextInternal = createContext<number | null>(null);

type BlueprintIdProviderProps = {
	blueprintId: number | undefined;
};
export const BlueprintIdProvider: FC<
	PropsWithChildren<BlueprintIdProviderProps>
> = ({ children, blueprintId }) => {
	if (blueprintId == null) {
		return null;
	}
	return (
		<BlueprintIdContextInternal.Provider value={blueprintId}>
			{children}
		</BlueprintIdContextInternal.Provider>
	);
};

export const useBlueprintId = () => {
	const context = useContext(BlueprintIdContextInternal);
	if (context == null) {
		throw new Error("useBlueprintId must be used within a BlueprintIdProvider");
	}
	return context;
};
