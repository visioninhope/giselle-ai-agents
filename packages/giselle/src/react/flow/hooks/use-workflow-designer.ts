import { useContext } from "react";
import { WorkflowDesignerContext } from "../context";
import { type AppStore, useAppStore } from "./store";

export function useWorkflowDesigner() {
	const context = useContext(WorkflowDesignerContext);
	if (context === undefined) {
		throw new Error(
			"useWorkflowDesigner must be used within a WorkflowDesignerProvider",
		);
	}
	return context;
}

// Safe workspace selector - throws error if workspace is null
export function useWorkspace() {
	return useAppStore((state) => {
		if (!state.workspace) {
			throw new Error("Workspace is not initialized");
		}
		return state.workspace;
	});
}

// Safe workspace selector with optional fallback
type NonNullWorkspaceAppStore = Omit<AppStore, "workspace"> & {
	workspace: NonNullable<AppStore["workspace"]>;
};
export function useWorkflowDesignerStore<T>(
	selector: (state2: NonNullWorkspaceAppStore) => T,
) {
	return useAppStore((state) => {
		if (!state.workspace) {
			throw new Error("Workspace is not initialized");
		}
		return selector(state as NonNullWorkspaceAppStore);
	});
}
