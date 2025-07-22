import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import { ActId, ActIndexObject, type ActObject } from "./object";
import { actPath, workspaceActPath } from "./object/paths";

export async function createAct(args: {
	context: GiselleEngineContext;
	jobsCount: number;
	trigger: string;
	workspaceId: WorkspaceId;
}) {
	const act: ActObject = {
		id: ActId.generate(),
		workspaceId: args.workspaceId,
		status: "inProgress",
		steps: {
			queued: args.jobsCount,
			inProgress: 0,
			warning: 0,
			completed: 0,
			failed: 0,
			cancelled: 0,
		},
		trigger: args.trigger,
		duration: {
			wallClock: 0,
			totalTask: 0,
		},
		usage: {
			promptTokens: 0,
			completionTokens: 0,
			totalTokens: 0,
		},
		createdAt: Date.now(),
		updatedAt: Date.now(),
		annotations: [],
	};
	await Promise.all([
		args.context.storage.setItem(actPath(act.id), act),
		addWorkspaceIndexItem({
			storage: args.context.storage,
			indexPath: workspaceActPath(args.workspaceId),
			item: act,
			itemSchema: ActIndexObject,
		}),
	]);
	return act;
}
