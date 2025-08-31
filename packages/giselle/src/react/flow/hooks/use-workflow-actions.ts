"use client";

import type { WorkflowActions } from "../store/workflow-store";
import { useWorkflow } from "./use-workflow";

export function useWorkflowActions(): WorkflowActions {
	return useWorkflow(
		(s) => s.actions,
		(a, b) => a === b,
	);
}
