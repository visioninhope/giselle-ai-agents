import { Secret, type SecretId, SecretIndex } from "@giselle-sdk/data-type";
import { z } from "zod/v4";
import type { GiselleEngineContext } from "../types";
import { secretPath, workspaceSecretIndexPath } from "./paths";

export async function deleteSecret(args: {
	context: GiselleEngineContext;
	secretId: SecretId;
}) {
	const secretLike = await args.context.storage.getItem(
		secretPath(args.secretId),
	);
	if (secretLike === null) {
		return;
	}
	const secret = Secret.parse(secretLike);
	await args.context.storage.removeItem(secretPath(args.secretId));

	const indexPath = workspaceSecretIndexPath(secret.workspaceId);
	const indexLike = await args.context.storage.getItem(indexPath);
	const parse = z.array(SecretIndex).safeParse(indexLike);
	if (!parse.success) {
		return;
	}
	const remaining = parse.data.filter((item) => item.id !== args.secretId);
	if (remaining.length === 0) {
		await args.context.storage.removeItem(indexPath);
		return;
	}
	await args.context.storage.setItem(indexPath, remaining);
}
