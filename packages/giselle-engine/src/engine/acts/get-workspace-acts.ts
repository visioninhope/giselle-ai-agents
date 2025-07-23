import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { getWorkspaceIndex } from "../utils/workspace-index";
import { Act, ActIndexObject } from "./object";
import { actPath, workspaceActPath } from "./object/paths";

export async function getWorkspaceActs(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
}) {
	const workspaceActIndices = await getWorkspaceIndex({
		storage: args.context.storage,
		indexPath: workspaceActPath(args.workspaceId),
		itemSchema: ActIndexObject,
	});
	return await Promise.all(
		workspaceActIndices.map((workspaceActIndex) =>
			args.context.storage.getItem(actPath(workspaceActIndex.id)),
		),
	).then((actLike) =>
		actLike
			.map((data) => {
				const parse = Act.safeParse(data);
				if (parse.success) {
					return parse.data;
				}
				return null;
			})
			.filter((data) => data !== null),
	);
}
