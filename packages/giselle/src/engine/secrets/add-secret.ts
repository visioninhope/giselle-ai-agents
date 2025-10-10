import {
	type Secret,
	SecretId,
	SecretIndex,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import { secretPath, workspaceSecretIndexPath } from "./paths";

export async function addSecret(args: {
	context: GiselleEngineContext;
	label: string;
	value: string;
	workspaceId: WorkspaceId;
	tags?: string[];
}) {
	const encryptedValue = await args.context.vault.encrypt(args.value);

	const secret: Secret = {
		id: SecretId.generate(),
		label: args.label,
		value: encryptedValue,
		createdAt: Date.now(),
		workspaceId: args.workspaceId,
		tags: args.tags,
	};

	await Promise.all([
		args.context.storage.setItem(secretPath(secret.id), secret),
		addWorkspaceIndexItem({
			context: args.context,
			indexPath: workspaceSecretIndexPath(args.workspaceId),
			item: secret,
			itemSchema: SecretIndex,
		}),
	]);
	return secret;
}
