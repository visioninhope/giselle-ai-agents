import { SecretIndex, type WorkspaceId } from "@giselle-sdk/data-type";
import { z } from "zod/v4";
import type { GiselleEngineContext } from "../types";
import { workspaceSecretIndexPath } from "./paths";

export async function getWorkspaceSecrets(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
}) {
	const workspaceSecretIndexLike = await args.context.storage.getItem(
		workspaceSecretIndexPath(args.workspaceId),
	);

	const parse = z.array(SecretIndex).safeParse(workspaceSecretIndexLike);
	return parse.success ? parse.data : [];
}
