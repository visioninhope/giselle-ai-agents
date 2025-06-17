import type { FlowRunId } from "./object";

export function flowRunPath(flowRunId: FlowRunId) {
	return `flow-runs/${flowRunId}/flow-run.json`;
}
