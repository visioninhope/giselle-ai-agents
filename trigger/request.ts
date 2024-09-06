// import {
// 	createRequestStackGenerator,
// 	runStackGenerator,
// 	runStep,
// 	updateRequestStatus,
// } from "@/services/agents/requests/actions/run";
// import { requestStatus } from "@/services/agents/requests/types";
// import { task } from "@trigger.dev/sdk/v3";

// type RequestArgs = {
// 	requestDbId: number;
// };

// export const requestRunner = task({
// 	id: "requestRunner",
// 	run: async (args: RequestArgs) => {
// 		await updateRequestStatus(args.requestDbId, requestStatus.inProgress);
// 		for await (const requestStack of createRequestStackGenerator(args)) {
// 			await requestStackRunner.triggerAndWait({
// 				requestDbId: args.requestDbId,
// 				requestStackDbId: requestStack.dbId,
// 			});
// 		}
// 		await updateRequestStatus(args.requestDbId, requestStatus.completed);
// 	},
// });

// type RequestStackRunnerArgs = {
// 	requestDbId: number;
// 	requestStackDbId: number;
// };
// export const requestStackRunner = task({
// 	id: "requestStackRunner",
// 	run: async (args: RequestStackRunnerArgs) => {
// 		for await (const step of runStackGenerator(args.requestStackDbId)) {
// 			await requestStepRunner.triggerAndWait({
// 				requestDbId: args.requestDbId,
// 				requestStackDbId: args.requestStackDbId,
// 				requestStepDbId: step.dbId,
// 			});
// 		}
// 	},
// });

// type RequestStepRunnerArgs = {
// 	requestDbId: number;
// 	requestStackDbId: number;
// 	requestStepDbId: number;
// };
// export const requestStepRunner = task({
// 	id: "requestStepRunner",
// 	run: async (args: RequestStepRunnerArgs) => {
// 		await runStep(
// 			args.requestDbId,
// 			args.requestStackDbId,
// 			args.requestStepDbId,
// 		);
// 	},
// });
