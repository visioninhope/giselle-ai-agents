import { z } from "zod/v4";
import type { Sequence } from "../../concepts/act";
import { ActId } from "../../concepts/identifiers";
import { resolveTrigger } from "../flows";
import {
	generateImage,
	generateText,
	getGeneration,
	type QueuedGeneration,
} from "../generations";
import { executeAction } from "../operations";
import { executeQuery } from "../operations/execute-query";
import type { GiselleEngineContext } from "../types";
import { getAct } from "./get-act";
import { createPatchQueue } from "./patch-queue";
import { executeAct } from "./shared/act-execution-utils";

function createStreamConsumer() {
	return new WritableStream({
		write() {},
		close() {},
		abort() {},
	});
}

export interface StartActCallbacks {
	sequenceStart?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceFail?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceComplete?: (args: { sequence: Sequence }) => void | Promise<void>;
	sequenceSkip?: (args: { sequence: Sequence }) => void | Promise<void>;
}

async function executeStep(args: {
	context: GiselleEngineContext;
	generation: QueuedGeneration;
	callbacks?: {
		onCompleted?: () => void | Promise<void>;
		onFailed?: (generation: QueuedGeneration) => void | Promise<void>;
	};
	useAiGateway: boolean;
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
				const generateTextStream = await generateText({
					...args,
					useExperimentalStorage: true,
					useAiGateway: args.useAiGateway,
				});

				// Consume the stream to trigger completion callbacks and persist generation results
				await generateTextStream.pipeTo(createStreamConsumer());
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
		console.log(_e);
		await args.callbacks?.onFailed?.(args.generation);
	}
}

export const StartActInputs = z.object({
	actId: ActId.schema,
	callbacks: z.optional(z.custom<StartActCallbacks>()),
	useAiGateway: z.boolean().default(false),
});
export type StartActInputs = z.infer<typeof StartActInputs>;

export async function startAct(
	args: StartActInputs & {
		context: GiselleEngineContext;
	},
) {
	const act = await getAct(args);

	// Create patch queue for this act execution
	const patchQueue = createPatchQueue(args.context);
	const applyPatches = patchQueue.createApplyPatches();

	let executionError: Error | null = null;
	try {
		await executeAct({
			act,
			applyPatches,
			startGeneration: async (generationId, callbacks) => {
				const generation = await getGeneration({
					context: args.context,
					useExperimentalStorage: true,
					generationId,
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
					context: args.context,
					generation: queuedGeneration,
					callbacks,
					useAiGateway: args.useAiGateway,
				});
			},
			onSequenceStart: async (sequence) => {
				await args.callbacks?.sequenceStart?.({ sequence });
			},
			onSequenceError: async (sequence) => {
				await args.callbacks?.sequenceFail?.({ sequence });
			},
			onSequenceComplete: async (sequence) => {
				await args.callbacks?.sequenceComplete?.({ sequence });
			},
			onSequenceSkip: async (sequence) => {
				await args.callbacks?.sequenceSkip?.({ sequence });
			},
			onActComplete: async () => {
				await patchQueue.flush();
			},
		});
	} catch (error) {
		executionError = error as Error;
	}

	patchQueue.cleanup();
	if (executionError !== null) {
		console.error("Execution failed:", executionError);
		throw executionError;
	}
}
