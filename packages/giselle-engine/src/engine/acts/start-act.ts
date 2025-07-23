import { AISDKError } from "ai";
import { z } from "zod/v4";
import { ActId } from "../../concepts/identifiers";
import { resolveTrigger } from "../flows";
import {
	type FailedGeneration,
	generateImage,
	generateText,
	getGeneration,
	type QueuedGeneration,
	setGeneration,
} from "../generations";
import { executeAction } from "../operations";
import { executeQuery } from "../operations/execute-query";
import type { GiselleEngineContext } from "../types";
import { Act, type Sequence } from "./object";
import { actPath } from "./object/paths";
import { patchAct } from "./patch-act";

export interface StartActCallbacks {
	sequenceStart?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceFail?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceComplete?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceSkip?: (args: { sequence: Sequence }) => void | Promise<void>;
}

async function executeStep(args: {
	context: GiselleEngineContext;
	generation: QueuedGeneration;
	actId: ActId;
}): Promise<boolean> {
	switch (args.generation.context.operationNode.content.type) {
		case "action":
			await executeAction(args);
			return false;
		case "imageGeneration":
			await generateImage({ ...args, useExperimentalStorage: true });
			return false;
		case "textGeneration": {
			let hadError = false;
			const result = await generateText({
				...args,
				useExperimentalStorage: true,
			});
			await result.consumeStream({
				onError: async (error) => {
					hadError = true;
					if (AISDKError.isInstance(error)) {
						const failedGeneration = {
							...args.generation,
							status: "failed",
							startedAt: Date.now(),
							failedAt: Date.now(),
							messages: [],
							error: {
								name: error.name,
								message: error.message,
							},
						} satisfies FailedGeneration;
						await Promise.all([
							setGeneration({
								...args,
								generation: failedGeneration,
								useExperimentalStorage: true,
							}),
							patchAct({
								...args,
								delta: {
									annotations: {
										push: [
											{
												level: "error",
												message: error.message,
											},
										],
									},
								},
							}),
						]);
					}
				},
			});
			return hadError;
		}
		case "trigger":
			await resolveTrigger(args);
			return false;
		case "query":
			await executeQuery(args);
			return false;
		default: {
			const _exhaustiveCheck: never =
				args.generation.context.operationNode.content.type;
			throw new Error(`Unhandled step type: ${_exhaustiveCheck}`);
		}
	}
}

async function actSequence(args: {
	actId: ActId;
	sequence: Sequence;
	context: GiselleEngineContext;
}) {
	await patchAct({
		context: args.context,
		actId: args.actId,
		delta: {
			"steps.inProgress": { increment: 1 },
			"steps.queued": { decrement: 1 },
		},
	});

	let hasSequenceError = false;

	const stepDurations = await Promise.all(
		args.sequence.steps.map(async (step) => {
			const generation = await getGeneration({
				context: args.context,
				useExperimentalStorage: true,
				generationId: step.generationId,
			});
			if (generation?.status !== "created") {
				throw new Error(`Unexpected generation status: ${generation?.status}`);
			}
			const stepStart = Date.now();
			const queuedGeneration: QueuedGeneration = {
				...generation,
				status: "queued",
				queuedAt: stepStart,
			};
			const errored = await executeStep({
				...args,
				generation: queuedGeneration,
			});
			const duration = Date.now() - stepStart;

			if (errored) {
				hasSequenceError = true;
			}

			return duration;
		}),
	);

	const totalTaskDuration = stepDurations.reduce((sum, d) => sum + d, 0);

	return { hasSequenceError, totalTaskDuration };
}

export const StartActInputs = z.object({
	actId: ActId.schema,
	callbacks: z.optional(z.custom<StartActCallbacks>()),
});
export type StartActInputs = z.infer<typeof StartActInputs>;

export async function startAct(
	args: StartActInputs & {
		context: GiselleEngineContext;
	},
) {
	const flowStart = Date.now();

	const act = await args.context.experimental_storage.getJson({
		path: actPath(args.actId),
		schema: Act,
	});

	for (let i = 0; i < act.sequences.length; i++) {
		const sequence = act.sequences[i];
		await args.callbacks?.sequenceStart?.({ sequence });
		const { totalTaskDuration, hasSequenceError } = await actSequence({
			sequence,
			context: args.context,
			actId: args.actId,
		});

		if (hasSequenceError) {
			// Skip remaining sequences
			for (let j = i + 1; j < act.sequences.length; j++) {
				await args.callbacks?.sequenceSkip?.({
					sequence: act.sequences[j],
				});
			}

			await Promise.all([
				args.callbacks?.sequenceFail?.({ sequence }),
				patchAct({
					...args,
					delta: {
						"steps.inProgress": { decrement: 1 },
						"steps.failed": { increment: 1 },
						"duration.totalTask": { increment: totalTaskDuration },
						status: { set: "failed" },
						"duration.wallClock": { set: Date.now() - flowStart },
					},
				}),
			]);
			return;
		}
		await Promise.all([
			args.callbacks?.sequenceComplete?.({ sequence }),
			patchAct({
				...args,
				delta: {
					"steps.inProgress": { decrement: 1 },
					"steps.completed": { increment: 1 },
					"duration.totalTask": { increment: totalTaskDuration },
				},
			}),
		]);
	}

	// All sequences completed successfully
	await patchAct({
		context: args.context,
		actId: args.actId,
		delta: {
			status: { set: "completed" },
			"duration.wallClock": { set: Date.now() - flowStart },
		},
	});
}
