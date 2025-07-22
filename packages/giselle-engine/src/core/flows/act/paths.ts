import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { ActId } from "./object";

export function actPath(actId: ActId) {
	return `acts/${actId}/act.json`;
}

export function workspaceActPath(workspaceId: WorkspaceId) {
	return `acts/byWorkspace/${workspaceId}.json`;
}
