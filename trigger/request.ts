import {
	createRequestStackGenerator,
	runStackGenerator,
	runStep,
} from "@/services/agents/requests/actions";
import { task } from "@trigger.dev/sdk/v3";

type RequestArgs = {
	requestDbId: number;
};

export const requestRunner = task({
	id: "requestRunner",
	run: async (args: RequestArgs) => {
		for await (const requestStack of createRequestStackGenerator(args)) {
			await requestStackRunner.triggerAndWait({
				requestStackDbId: requestStack.dbId,
			});
		}
	},
});

type RequestStackRunnerArgs = {
	requestStackDbId: number;
};
export const requestStackRunner = task({
	id: "requestStackRunner",
	run: async (args: RequestStackRunnerArgs) => {
		for await (const step of runStackGenerator(args.requestStackDbId)) {
			await requestStepRunner.triggerAndWait({
				requestStepDbId: step.dbId,
			});
		}
	},
});

type RequestStepRunnerArgs = {
	requestStepDbId: number;
};
export const requestStepRunner = task({
	id: "requestStepRunner",
	run: async (args: RequestStepRunnerArgs) => {
		await runStep(args.requestStepDbId);
	},
});
