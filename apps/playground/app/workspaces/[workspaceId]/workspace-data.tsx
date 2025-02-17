"use client";

import type { Workspace } from "@giselle-sdk/data-type";
import { createContext, useContext } from "react";

export const WorkspaceDataContext = createContext<Workspace | null>(null);

export function WorkspaceDataProvider({
	value,
	children,
}: {
	value: Workspace;
	children: React.ReactNode;
}) {
	return (
		<WorkspaceDataContext.Provider value={value}>
			{children}
		</WorkspaceDataContext.Provider>
	);
}

export function useWorkspaceData() {
	const data = useContext(WorkspaceDataContext);
	if (data === null) {
		throw new Error("Data context is not provided");
	}
	return data;
}
