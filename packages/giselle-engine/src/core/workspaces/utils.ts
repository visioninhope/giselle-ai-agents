import {
	Node,
	type Output,
	Workspace,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { ZodIssue } from "zod";

export function workspacePath(workspaceId: WorkspaceId) {
	return `workspaces/${workspaceId}/workspace.json`;
}

function getValueAtPath(obj: any, path: (string | number)[]) {
	return path.reduce(
		(acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
		obj,
	);
}

function setValueAtPath(obj: any, path: (string | number)[], value: any) {
	if (path.length === 0) return;

	const lastKey = path[path.length - 1];
	const parentPath = path.slice(0, -1);

	let parent = obj;
	for (const key of parentPath) {
		if (parent[key] === undefined) {
			parent[key] = typeof key === "number" ? [] : {};
		}
		parent = parent[key];
	}

	parent[lastKey] = value;
}

export function repairAccessor(workspaceLike: unknown, issue: ZodIssue) {
	const lastPath = issue.path[issue.path.length - 1];
	if (lastPath === "accessor") {
		const output = getValueAtPath(
			workspaceLike,
			issue.path.slice(0, -1),
		) as unknown as Output;
		// @ts-expect-error old schema key
		setValueAtPath(workspaceLike, issue.path, output.accesor);
		return workspaceLike;
	}
	return workspaceLike;
}

export async function setWorkspace({
	storage,
	workspaceId,
	workspace,
}: {
	storage: Storage;
	workspaceId: WorkspaceId;
	workspace: Workspace;
}) {
	await storage.setItem(workspacePath(workspaceId), workspace, {
		// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
		cacheControlMaxAge: 0,
	});
}

function parseAndRepairWorkspace(workspaceLike: unknown, repair = false) {
	const parseResult = Workspace.safeParse(workspaceLike);
	if (parseResult.success) {
		return parseResult.data;
	}
	if (repair) {
		throw new Error(`Invalid workspace: ${parseResult.error}`);
	}

	const repaired = workspaceLike;
	for (const issue of parseResult.error.issues) {
		repairAccessor(repaired, issue);
	}
	return parseAndRepairWorkspace(repaired, true);
}

export async function getWorkspace({
	storage,
	workspaceId,
}: {
	storage: Storage;
	workspaceId: WorkspaceId;
}) {
	const result = await storage.getItem(workspacePath(workspaceId));
	return parseAndRepairWorkspace(result);
}
