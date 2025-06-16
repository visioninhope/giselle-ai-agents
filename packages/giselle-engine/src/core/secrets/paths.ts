import type { SecretId, WorkspaceId } from "@giselle-sdk/data-type";

export function secretPath(secretId: SecretId) {
	return `secrets/${secretId}/secret.json`;
}

export function workspaceSecretIndexPath(workspaceId: WorkspaceId) {
	return `secrets/byWorkspace/${workspaceId}.json`;
}
