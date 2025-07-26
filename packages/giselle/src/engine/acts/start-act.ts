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
	createStepCountPatches,
	createStepCountTransition,
	type ExecutionContext,
	executeSequence,
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
	const flowStart = Date.now();

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

	await patchAdapter.applyPatches(args.actId, [
		patches.status.set("inProgress"),
	]);

	let hasFailure = false;

	for (let i = 0; i < act.sequences.length; i++) {
		const sequence = act.sequences[i];

		await args.callbacks?.sequenceStart?.({ sequence });

		// Set sequence status to running
		await patchAdapter.applyPatches(args.actId, [
			patches.sequences(i).status.set("running"),
		]);

		const result = await executeSequence(sequence, i, executionContext, {
			onSequenceStart: async () => {
				// Already set to running above
			},
			onSequenceError: async (_error) => {
				hasFailure = true;
				await Promise.all([
					args.callbacks?.sequenceFail?.({ sequence }),
					patchAdapter.applyPatches(args.actId, [
						patches.sequences(i).status.set("failed"),
					]),
				]);
				// Skip remaining sequences
				for (let j = i + 1; j < act.sequences.length; j++) {
					await args.callbacks?.sequenceSkip?.({
						sequence: act.sequences[j],
					});
				}
			},
			onSequenceComplete: async () => {
				await patchAdapter.applyPatches(args.actId, [
					patches.sequences(i).status.set("completed"),
				]);
			},
			onStepStart: async (_step, stepIndex) => {
				await patchAdapter.applyPatches(args.actId, [
					...createStepCountPatches([
						createStepCountTransition("queued", "inProgress", 1),
					]),
					patches.sequences(i).steps(stepIndex).status.set("running"),
				]);
			},
			onStepError: async (step, stepIndex, error) => {
				await patchAdapter.applyPatches(args.actId, [
					...createStepCountPatches([
						createStepCountTransition("inProgress", "failed", 1),
					]),
					patches.sequences(i).steps(stepIndex).status.set("failed"),
					patches.duration.totalTask.increment(step.duration),
					patches.sequences(i).steps(stepIndex).duration.set(step.duration),
					patches.sequences(i).duration.totalTask.increment(step.duration),
					patches.annotations.push([
						{
							level: "error",
							message: error instanceof Error ? error.message : "Unknown error",
							sequenceId: sequence.id,
							stepId: step.id,
						},
					]),
				]);
			},
			onStepComplete: async (step, stepIndex) => {
				await patchAdapter.applyPatches(args.actId, [
					...createStepCountPatches([
						createStepCountTransition("inProgress", "completed", 1),
					]),
					patches.duration.totalTask.increment(step.duration),
					patches.sequences(i).steps(stepIndex).duration.set(step.duration),
					patches.sequences(i).duration.totalTask.increment(step.duration),
					patches.sequences(i).steps(stepIndex).status.set("completed"),
				]);
			},
		});

		if (result.hasError) {
			hasFailure = true;
			// Update sequence duration
			await patchAdapter.applyPatches(args.actId, [
				patches.sequences(i).duration.wallClock.set(result.wallClockDuration),
			]);
			// Skip remaining sequences after failure
			break;
		}

		// Update sequence duration for successful completion
		await patchAdapter.applyPatches(args.actId, [
			patches.sequences(i).duration.wallClock.set(result.wallClockDuration),
		]);

		await args.callbacks?.sequenceComplete?.({ sequence });
	}

	await patchAdapter.applyPatches(args.actId, [
		patches.status.set(hasFailure ? "failed" : "completed"),
		patches.duration.wallClock.set(Date.now() - flowStart),
	]);
}
