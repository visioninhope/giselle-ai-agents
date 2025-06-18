import type { GiselleEngineContext } from "../types";
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import {
	type FlowRunId,
	FlowRunIndexObject,
	type FlowRunObject,
} from "./run/object";
import { patchFlowRun } from "./run/patch-object";
import { flowRunPath, workspaceFlowRunPath } from "./run/paths";

type PatchValue<T> = T extends number
	? { increment?: number; decrement?: number; set?: number }
	: T extends string
		? { set: string }
		: never;

type FlowRunPath = DotPaths<FlowRunObject>;

type PatchDelta = {
	[P in FlowRunPath]?: PatchValue<Get<FlowRunObject, P>>;
};

export async function patchRun(args: {
	context: GiselleEngineContext;
	flowRunId: FlowRunId;
	delta: PatchDelta;
}) {
	// Get the current flow run
	const currentFlowRun = await args.context.storage.getItem<FlowRunObject>(
		flowRunPath(args.flowRunId),
	);

	if (!currentFlowRun) {
		throw new Error(`Flow run not found: ${args.flowRunId}`);
	}

	// Apply the patch
	const updatedFlowRun = patchFlowRun(currentFlowRun, args.delta);

	// Update storage
	await Promise.all([
		args.context.storage.setItem(flowRunPath(args.flowRunId), updatedFlowRun),
		addWorkspaceIndexItem({
			storage: args.context.storage,
			indexPath: workspaceFlowRunPath(updatedFlowRun.workspaceId),
			item: updatedFlowRun,
			itemSchema: FlowRunIndexObject,
		}),
	]);

	return updatedFlowRun;
}

export type { PatchDelta };

// Type helpers (copied from patch-object.ts for consistency)
type IsRecord<T> = T extends Record<string, unknown> ? T : never;

type DotPaths<T, Prefix extends string = "", Depth extends number = 5> = [
	Depth,
] extends [never]
	? never
	: {
			[K in keyof T]: IsRecord<T[K]> extends never
				? `${Prefix}${K & string}`
				:
						| `${Prefix}${K & string}`
						| DotPaths<
								IsRecord<T[K]>,
								`${Prefix}${K & string}.`,
								Decrement[Depth]
						  >;
		}[keyof T];

type Decrement = [never, 0, 1, 2, 3, 4, 5];

type Get<T, Path extends string> = Path extends `${infer K}.${infer R}`
	? K extends keyof T
		? Get<T[K], R>
		: never
	: Path extends keyof T
		? T[Path]
		: never;
