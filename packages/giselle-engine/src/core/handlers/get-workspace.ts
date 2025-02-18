import { Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import { z } from "zod";
import { getWorkspace as getWorkspaceInternal } from "../helpers/get-workspace";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = z.object({
	workspaceId: WorkspaceId.schema,
});
export const Output = z.object({
	workspace: Workspace,
});

export async function getWorkspace({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const workspace = await getWorkspaceInternal({
		storage: context.storage,
		workspaceId: input.workspaceId,
	});
	return Output.parse({ workspace });
}
