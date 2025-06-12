import {
	type Secret,
	SecretId,
	SecretIndex,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { secretPath, workspaceSecretIndexPath } from "./paths";

export async function addSecret(args: {
	context: GiselleEngineContext;
	label: string;
	value: string;
	workspaceId: WorkspaceId;
}) {
	const encryptedValue =
		(await args.context.vault?.encrypt(args.value)) ?? args.value;

	const secret: Secret = {
		id: SecretId.generate(),
		label: args.label,
		value: encryptedValue,
		createdAt: Date.now(),
		workspaceId: args.workspaceId,
	};

	await Promise.all([
		args.context.storage.setItem(secretPath(secret.id), secret),
		args.context.storage.setItem(
			workspaceSecretIndexPath(args.workspaceId),
			SecretIndex.parse(secret),
		),
	]);
	return secret.id;
}
