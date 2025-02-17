import { Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import type { StorageMeta } from "unstorage";
import { z } from "zod";
import { setWorkspace } from "../helpers/set-workspace";
import { workspacePath } from "../helpers/workspace-path";
import type { GiselleEngineHandlerArgs } from "./types";

export const Input = z.object({
	workspaceId: WorkspaceId.schema,
	workspace: Workspace,
});
export const Output = z.object({
	workspace: Workspace,
	meta: z.custom<StorageMeta>(),
});
export async function saveWorkspace({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	await setWorkspace({
		storage: context.storage,
		workspaceId: input.workspaceId,
		workspace: input.workspace,
	});
	const meta = await context.storage.getMeta(workspacePath(input.workspaceId));
	return Output.parse({
		workspace: input.workspace,
		meta,
	});
}
