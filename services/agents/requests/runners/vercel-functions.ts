// "use server";

// import { db, requests } from "@/drizzle";
// import { eq } from "drizzle-orm";
// import {
// 	createRequestStackGenerator,
// 	runStackGenerator,
// 	runStep,
// 	startRequest,
// 	updateRequestStatus,
// } from "../actions/run";
// import { requestStatus } from "../types";
// import type { StartRunnerArgs } from "./types";

// export const start = async (args: StartRunnerArgs) => {
// 	await startRequest(args.requestId);
// 	for await (const requestStack of createRequestStackGenerator({
// 		requestId: args.requestId,
// 	})) {
// 		for await (const step of runStackGenerator(requestStack.dbId)) {
// 			await runStep(
// 				args.requestId,
// 				requestStack.requestDbId,
// 				requestStack.dbId,
// 				step.dbId,
// 			);
// 		}
// 	}
// 	await updateRequestStatus(args.requestId, requestStatus.completed);
// };
