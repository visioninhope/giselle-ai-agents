import { dataMod } from "@giselle-sdk/data-mod";
import { Run, type RunId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";

export function runPath(runId: RunId) {
	return `runs/${runId}/run.json`;
}

export async function setRun({
	storage,
	run,
}: {
	storage: Storage;
	run: Run;
}) {
	switch (run.status) {
		case "queued":
			return await storage.set(runPath(run.id), Run.parse(run), {
				// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
				cacheControlMaxAge: 0,
			});
	}
}

function parseAndMod(runLike: unknown, mod = false) {
	const parseResult = Run.safeParse(runLike);
	if (parseResult.success) {
		return parseResult.data;
	}
	if (mod) {
		throw parseResult.error;
	}

	let modData = runLike;
	for (const issue of parseResult.error.issues) {
		modData = dataMod(modData, issue);
	}
	return parseAndMod(modData, true);
}

export async function getRun({
	storage,
	runId,
}: {
	storage: Storage;
	runId: RunId;
}): Promise<Run | undefined> {
	const run = await storage.get(runPath(runId));
	if (run == null) {
		return undefined;
	}
	return parseAndMod(run);
}
