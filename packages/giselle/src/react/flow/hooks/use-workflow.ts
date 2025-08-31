"use client";

import { useStoreWithEqualityFn } from "zustand/traditional";
import { useWorkflowStoreContext } from "../store/context";
import type { WorkflowStore } from "../store/workflow-store";

export function useWorkflow<T>(
	selector: (state: WorkflowStore) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T {
	const store = useWorkflowStoreContext();
	return useStoreWithEqualityFn(store, selector, equalityFn);
}
