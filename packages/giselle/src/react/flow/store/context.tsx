"use client";

import { createContext, useContext } from "react";
import type { StoreApi } from "zustand";
import type { WorkflowStore } from "./workflow-store";

export const WorkflowStoreContext =
	createContext<StoreApi<WorkflowStore> | null>(null);

export function useWorkflowStoreContext() {
	const ctx = useContext(WorkflowStoreContext);
	if (ctx === null) {
		throw new Error(
			"useWorkflow must be used within a WorkflowDesignerProvider",
		);
	}
	return ctx;
}
