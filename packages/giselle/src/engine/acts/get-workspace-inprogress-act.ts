import type { WorkspaceId } from "@giselle-sdk/data-type";
import { Act, ActIndexObject } from "../../concepts/act";
import type { GiselleEngineContext } from "../types";
import { getWorkspaceIndex } from "../utils/workspace-index";
import { actPath, workspaceActPath } from "./object/paths";

export async function getWorkspaceInprogressAct({
	context,
	workspaceId,
}: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
}) {
	context.logger.debug("getWorkspaceInprogressAct");
	const workspaceActIndexes = await getWorkspaceIndex({
		context,
		indexPath: workspaceActPath(workspaceId),
		itemSchema: ActIndexObject,
		useExperimentalStorage: true,
	});
	context.logger.debug(
		{ workspaceActIndices: workspaceActIndexes },
		"workspaceActIndices:",
	);
	const workspaceActs = await Promise.all(
		workspaceActIndexes.map((workspaceActIndex) =>
			context.storage.getItem(actPath(workspaceActIndex.id)),
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
	context.logger.debug({ workspaceActs }, "workspaceActs:");
	const inprogressActs = workspaceActs
		.sort((a, b) => a.createdAt - b.createdAt)
		.filter((a) => a.status === "inProgress");
	context.logger.debug({ inprogressActs }, "inprogressActs:");
	if (inprogressActs.length === 0) {
		context.logger.debug("inprogress acts none");
		return undefined;
	}
	if (inprogressActs.length > 1) {
		context.logger.warn(
			`workspace(${workspaceId}) has ${inprogressActs.length}s acts.`,
		);
	}
	context.logger.debug(`return inprogress act(${inprogressActs[0].id})`);
	return inprogressActs[0];
}
