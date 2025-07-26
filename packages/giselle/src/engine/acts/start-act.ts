import { AISDKError } from "ai";
import { z } from "zod/v4";
import { Act, type Sequence } from "../../concepts/act";
import { ActId, type GenerationId } from "../../concepts/identifiers";
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
import {
	type ActPatchAdapter,
	type ExecutionContext,
	executeAct,
	type GenerationAdapter,
} from "./shared/act-execution-utils";

export interface StartActCallbacks {
	sequenceStart?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceFail?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceComplete?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceSkip?: (args: { sequence: Sequence }) => void | Promise<void>;
}

// Create adapters for the engine context
function createEngineAdapters(context: GiselleEngineContext): {
	patchAdapter: ActPatchAdapter;
	generationAdapter: GenerationAdapter<QueuedGeneration>;
} {
	const patchAdapter: ActPatchAdapter = {
		applyPatches: async (actId, patches) => {
			await patchAct({ context, actId, patches });
		},
	};

	const generationAdapter: GenerationAdapter<QueuedGeneration> = {
		getGeneration: async (generationId) => {
			const generation = await getGeneration({
				context,
				useExperimentalStorage: true,
				generationId: generationId as GenerationId,
			});
			if (generation?.status === "created") {
				return {
					...generation,
					status: "queued",
					queuedAt: Date.now(),
				} as QueuedGeneration;
			}
			return generation as QueuedGeneration | undefined;
		},
		startGeneration: async (generationId, callbacks) => {
			const generation = await getGeneration({
				context,
				useExperimentalStorage: true,
				generationId: generationId as GenerationId,
			});
			if (!generation || generation.status !== "created") {
				return;
			}
			const queuedGeneration: QueuedGeneration = {
				...generation,
				status: "queued",
				queuedAt: Date.now(),
			};
			await executeStep({
				context,
				generation: queuedGeneration,
				callbacks,
			});
		},
		stopGeneration: async (_generationId) => {
			// Not implemented in engine - generations run to completion
		},
	};

	return { patchAdapter, generationAdapter };
}

async function executeStep(args: {
	context: GiselleEngineContext;
	generation: QueuedGeneration;
	callbacks?: {
		onCompleted?: () => void | Promise<void>;
		onFailed?: (generation: QueuedGeneration) => void | Promise<void>;
	};
}) {
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
				let errorOccurred = false;
				await result.consumeStream({
					onError: async (error) => {
						if (AISDKError.isInstance(error)) {
							errorOccurred = true;
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
								args.callbacks?.onFailed?.(args.generation),
							]);
						}
					},
				});
				if (errorOccurred) {
					return;
				}
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
		await args.callbacks?.onCompleted?.();
	} catch (_e) {
		await args.callbacks?.onFailed?.(args.generation);
	}
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
	const act = await args.context.experimental_storage.getJson({
		path: actPath(args.actId),
		schema: Act,
	});

	const { patchAdapter, generationAdapter } = createEngineAdapters(
		args.context,
	);
	const executionContext: ExecutionContext<QueuedGeneration> = {
		actId: args.actId,
		patchAdapter,
		generationAdapter,
	};

	await executeAct({
		act,
		context: executionContext,
		options: {
			onActStart: async () => {
				await patchAdapter.applyPatches(args.actId, [
					patches.status.set("inProgress"),
				]);
			},
			onSequenceStart: async (sequence, sequenceIndex) => {
				await args.callbacks?.sequenceStart?.({ sequence });
				await patchAdapter.applyPatches(args.actId, [
					patches.sequences(sequenceIndex).status.set("running"),
				]);
			},
			onSequenceFail: async (sequence, sequenceIndex, _error, result) => {
				await Promise.all([
					args.callbacks?.sequenceFail?.({ sequence }),
					patchAdapter.applyPatches(args.actId, [
						patches.sequences(sequenceIndex).status.set("failed"),
						patches
							.sequences(sequenceIndex)
							.duration.wallClock.set(result.wallClockDuration),
					]),
				]);
			},
			onSequenceComplete: async (sequence, sequenceIndex, result) => {
				await patchAdapter.applyPatches(args.actId, [
					patches.sequences(sequenceIndex).status.set("completed"),
					patches
						.sequences(sequenceIndex)
						.duration.wallClock.set(result.wallClockDuration),
				]);
				await args.callbacks?.sequenceComplete?.({ sequence });
			},
			onSequenceSkip: async (sequence) => {
				await args.callbacks?.sequenceSkip?.({ sequence });
			},
			onStepStart: async (_step, sequenceIndex, stepIndex) => {
				await patchAdapter.applyPatches(args.actId, [
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.status.set("running"),
				]);
			},
			onStepError: async (step, sequenceIndex, stepIndex, error) => {
				await patchAdapter.applyPatches(args.actId, [
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.status.set("failed"),
					patches.duration.totalTask.increment(step.duration),
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.duration.set(step.duration),
					patches
						.sequences(sequenceIndex)
						.duration.totalTask.increment(step.duration),
					patches.annotations.push([
						{
							level: "error",
							message: error instanceof Error ? error.message : "Unknown error",
							sequenceId: act.sequences[sequenceIndex].id,
							stepId: step.id,
						},
					]),
				]);
			},
			onStepComplete: async (step, sequenceIndex, stepIndex) => {
				await patchAdapter.applyPatches(args.actId, [
					patches.duration.totalTask.increment(step.duration),
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.duration.set(step.duration),
					patches
						.sequences(sequenceIndex)
						.duration.totalTask.increment(step.duration),
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.status.set("completed"),
				]);
			},
			onActComplete: async (hasError, duration) => {
				await patchAdapter.applyPatches(args.actId, [
					patches.status.set(hasError ? "failed" : "completed"),
					patches.duration.wallClock.set(duration),
				]);
			},
		},
	});
}
