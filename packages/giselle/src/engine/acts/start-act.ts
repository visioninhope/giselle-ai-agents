import { AISDKError } from "ai";
import { z } from "zod/v4";
import { Act, type Sequence, type Step } from "../../concepts/act";
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
import { patches } from "./object/patch-creators";
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
	step: Step;
	onStart: () => Promise<void>;
	onError: (error: unknown, step: Step) => Promise<void>;
	onFinish: (step: Step) => Promise<void>;
}) {
	await args.onStart();
	const startedAt = Date.now();
	try {
		switch (args.generation.context.operationNode.content.type) {
			case "action":
				await executeAction(args);
				break;
			case "imageGeneration":
				await generateImage({ ...args, useExperimentalStorage: true });
				break;
			case "textGeneration": {
				const result = await generateText({
					...args,
					useExperimentalStorage: true,
				});
				console.log("consuming....START");
				await result.consumeStream({
					onError: async (error) => {
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
								args.onError(new Error(error.message), {
									...args.step,
									duration: Date.now() - startedAt,
								}),
							]);
						}
					},
				});
				console.log("consuming....END");
				break;
			}
			case "trigger":
				await resolveTrigger(args);
				break;
			case "query":
				await executeQuery(args);
				break;
			default: {
				const _exhaustiveCheck: never =
					args.generation.context.operationNode.content.type;
				throw new Error(`Unhandled step type: ${_exhaustiveCheck}`);
			}
		}
	} catch (e) {
		await args.onError(e, {
			...args.step,
			duration: Date.now() - startedAt,
		});
		return;
	}
	await args.onFinish({
		...args.step,
		duration: Date.now() - startedAt,
	});
}

async function actSequence(args: {
	actId: ActId;
	sequenceIndex: number;
	sequence: Sequence;
	context: GiselleEngineContext;
	onStart: () => Promise<void>;
	onError: (sequence: Sequence) => Promise<void>;
	onFinish: (sequence: Sequence) => Promise<void>;
}) {
	await args.onStart();
	const startedAt = Date.now();
	let totalTask = 0;
	let hasError = false;
	await Promise.all(
		args.sequence.steps.map(async (step, index) => {
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
			await executeStep({
				...args,
				generation: queuedGeneration,
				step,
				onStart: async () => {
					await patchAct({
						context: args.context,
						actId: args.actId,
						patches: [
							patches.steps.inProgress.increment(1),
							patches.steps.queued.decrement(1),
							patches
								.sequences(args.sequenceIndex)
								.steps(index)
								.status.set("running"),
						],
					});
				},
				onError: async (_, step) => {
					hasError = true;
					totalTask += step.duration;
					await patchAct({
						...args,
						patches: [
							patches.steps.inProgress.decrement(1),
							patches.steps.failed.increment(1),
							patches
								.sequences(args.sequenceIndex)
								.steps(index)
								.status.set("failed"),
							patches.duration.totalTask.increment(step.duration),
							patches
								.sequences(args.sequenceIndex)
								.steps(index)
								.duration.set(step.duration),
							patches
								.sequences(args.sequenceIndex)
								.duration.totalTask.increment(step.duration),
							patches.annotations.push([
								{
									level: "error",
									/** @todo replace real error */
									message: "error",
									sequenceId: args.sequence.id,
									stepId: step.id,
								},
							]),
						],
					});
				},
				onFinish: async (step) => {
					totalTask += step.duration;
					console.log(`step finish: ${step.name}`);
					await patchAct({
						context: args.context,
						actId: args.actId,
						patches: [
							patches.steps.inProgress.decrement(1),
							patches.steps.completed.increment(1),
							patches.duration.totalTask.increment(step.duration),
							patches
								.sequences(args.sequenceIndex)
								.steps(index)
								.duration.set(step.duration),
							patches
								.sequences(args.sequenceIndex)
								.duration.totalTask.increment(step.duration),
							patches
								.sequences(args.sequenceIndex)
								.steps(index)
								.status.set("completed"),
						],
					});
				},
			});
		}),
	);
	if (hasError) {
		await args.onError({
			...args.sequence,
			duration: {
				totalTask,
				wallClock: Date.now() - startedAt,
			},
		});
		return;
	}

	await args.onFinish({
		...args.sequence,
		duration: {
			totalTask,
			wallClock: Date.now() - startedAt,
		},
	});
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

	await patchAct({
		...args,
		patches: [patches.status.set("inProgress")],
	});

	for (let i = 0; i < act.sequences.length; i++) {
		const sequence = act.sequences[i];

		await args.callbacks?.sequenceStart?.({ sequence });

		await actSequence({
			sequence,
			sequenceIndex: i,
			context: args.context,
			actId: args.actId,
			onStart: async () => {
				await patchAct({
					context: args.context,
					actId: args.actId,
					patches: [patches.sequences(i).status.set("running")],
				});
			},
			onError: async (sequence) => {
				await Promise.all([
					args.callbacks?.sequenceFail?.({ sequence }),
					patchAct({
						context: args.context,
						actId: args.actId,
						patches: [patches.sequences(i).status.set("failed")],
					}),
				]);
				for (let j = i + 1; j < act.sequences.length; j++) {
					await args.callbacks?.sequenceSkip?.({
						sequence: act.sequences[j],
					});
				}
			},
			onFinish: async () => {
				await patchAct({
					context: args.context,
					actId: args.actId,
					patches: [patches.sequences(i).status.set("completed")],
				});
			},
		});

		await args.callbacks?.sequenceComplete?.({ sequence });
	}

	await patchAct({
		context: args.context,
		actId: args.actId,
		patches: [
			patches.status.set("completed"),
			patches.duration.wallClock.set(Date.now() - flowStart),
		],
	});
}
