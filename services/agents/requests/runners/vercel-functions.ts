"use server";

import { db, requests } from "@/drizzle";
import { eq } from "drizzle-orm";
import {
	createRequestStackGenerator,
	runStackGenerator,
	runStep,
} from "../actions";
import type { StartRunnerArgs } from "./types";

export const start = async (args: StartRunnerArgs) => {
	const [request] = await db
		.select({ dbId: requests.dbId })
		.from(requests)
		.where(eq(requests.id, args.requestId));
	for await (const requestStack of createRequestStackGenerator({
		requestDbId: request.dbId,
	})) {
		for await (const step of runStackGenerator(requestStack.dbId)) {
			await runStep(step.dbId);
		}
	}
};
