import { SecretIndex, type WorkspaceId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { getWorkspaceIndex } from "../utils/workspace-index";
import { workspaceSecretIndexPath } from "./paths";

export async function getWorkspaceSecrets(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
	tags?: string[];
}) {
	const secrets = await getWorkspaceIndex({
		context: args.context,
		indexPath: workspaceSecretIndexPath(args.workspaceId),
		itemSchema: SecretIndex,
	});

	if (args.tags === undefined || args.tags.length === 0) {
		return secrets;
	}

	return secrets.filter((secret) => {
		const secretTags = secret.tags ?? [];
		return args.tags?.every((tag) => secretTags.includes(tag));
	});
}
