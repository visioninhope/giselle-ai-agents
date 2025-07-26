import type { Act, ActId, Sequence, Step } from "../../../concepts/act";
import type { GenerationStatus } from "../../../concepts/generation";
import type { Patch } from "../object/patch-object";

/**
 * Utility for tracking duration in act execution
 */
export interface DurationTracker {
	startTime: number;
	getDuration(): number;
	reset(): void;
}

export function createDurationTracker(startTime?: number): DurationTracker {
	let start = startTime ?? Date.now();

	return {
		startTime: start,
		getDuration: () => Date.now() - start,
		reset: () => {
			start = Date.now();
		},
	};
}

/**
 * Manager for step count transitions
 */
export interface StepCountTransition {
	from: keyof Act["steps"];
	to: keyof Act["steps"];
	count: number;
}

export function createStepCountTransition(
	from: keyof Act["steps"],
	to: keyof Act["steps"],
	count: number,
): StepCountTransition {
	return { from, to, count };
}

/**
 * Status state machine for managing act/sequence/step status transitions
 */
export type ActStatus = Act["status"];
export type SequenceStatus = GenerationStatus;
export type StepStatus = GenerationStatus;

export interface StatusTransition<T> {
	from: T;
	to: T;
	isValid: boolean;
}

export function validateActStatusTransition(
	from: ActStatus,
	to: ActStatus,
): StatusTransition<ActStatus> {
	const validTransitions: Record<ActStatus, ActStatus[]> = {
		inProgress: ["completed", "failed", "cancelled"],
		completed: [],
		failed: [],
		cancelled: [],
	};

	const isValid = validTransitions[from]?.includes(to) ?? false;
	return { from, to, isValid };
}

export function validateSequenceStatusTransition(
	from: SequenceStatus,
	to: SequenceStatus,
): StatusTransition<SequenceStatus> {
	const validTransitions: Record<SequenceStatus, SequenceStatus[]> = {
		created: ["queued", "cancelled"],
		queued: ["running", "cancelled"],
		running: ["completed", "failed", "cancelled"],
		completed: [],
		failed: [],
		cancelled: [],
	};

	const isValid = validTransitions[from]?.includes(to) ?? false;
	return { from, to, isValid };
}

export function validateStepStatusTransition(
	from: StepStatus,
	to: StepStatus,
): StatusTransition<StepStatus> {
	// Steps use the same status transitions as sequences
	return validateSequenceStatusTransition(from, to);
}

/**
 * Adapter interfaces for context-specific implementations
 */
export interface ActPatchAdapter {
	applyPatches(actId: ActId, patches: Patch[]): Promise<void>;
}

export interface GenerationAdapter<TGeneration> {
	getGeneration(generationId: string): Promise<TGeneration | undefined>;
	startGeneration(
		generationId: string,
		callbacks?: {
			onCompleted?: () => void | Promise<void>;
			onFailed?: (generation: TGeneration) => void | Promise<void>;
		},
	): Promise<void>;
	stopGeneration(generationId: string): Promise<void>;
}

export interface ErrorHandler {
	handleError(
		error: unknown,
		context: {
			actId: ActId;
			sequenceId?: string;
			stepId?: string;
		},
	): Promise<void>;
}

/**
 * Core execution flow logic
 */
export interface ExecutionContext<TGeneration> {
	actId: ActId;
	patchAdapter: ActPatchAdapter;
	generationAdapter: GenerationAdapter<TGeneration>;
	errorHandler?: ErrorHandler;
}

export interface SequenceExecutionResult {
	hasError: boolean;
	totalTaskDuration: number;
	wallClockDuration: number;
}

export async function executeSequence<TGeneration>(
	sequence: Sequence,
	_sequenceIndex: number,
	context: ExecutionContext<TGeneration>,
	options?: {
		onSequenceStart?: () => Promise<void>;
		onSequenceError?: (error: unknown) => Promise<void>;
		onSequenceComplete?: () => Promise<void>;
		onStepStart?: (step: Step, stepIndex: number) => Promise<void>;
		onStepError?: (
			step: Step,
			stepIndex: number,
			error: unknown,
		) => Promise<void>;
		onStepComplete?: (step: Step, stepIndex: number) => Promise<void>;
		cancelSignal?: { current: boolean };
	},
): Promise<SequenceExecutionResult> {
	const sequenceTracker = createDurationTracker();
	let totalTaskDuration = 0;
	let hasError = false;

	// Start sequence
	await options?.onSequenceStart?.();

	// Execute all steps in parallel
	await Promise.all(
		sequence.steps.map(async (step, stepIndex) => {
			if (options?.cancelSignal?.current) {
				return;
			}

			const stepTracker = createDurationTracker();

			try {
				await options?.onStepStart?.(step, stepIndex);

				const generation = await context.generationAdapter.getGeneration(
					step.generationId,
				);
				if (!generation || options?.cancelSignal?.current) {
					return;
				}

				await context.generationAdapter.startGeneration(step.generationId, {
					onCompleted: async () => {
						const duration = stepTracker.getDuration();
						totalTaskDuration += duration;
						await options?.onStepComplete?.({ ...step, duration }, stepIndex);
					},
					onFailed: async (failedGeneration) => {
						hasError = true;
						const duration = stepTracker.getDuration();
						totalTaskDuration += duration;
						await options?.onStepError?.(
							{ ...step, duration },
							stepIndex,
							failedGeneration,
						);
					},
				});
			} catch (error) {
				hasError = true;
				const duration = stepTracker.getDuration();
				totalTaskDuration += duration;
				await options?.onStepError?.({ ...step, duration }, stepIndex, error);
			}
		}),
	);

	// Handle sequence completion
	if (hasError) {
		await options?.onSequenceError?.(new Error("Sequence execution failed"));
	} else {
		await options?.onSequenceComplete?.();
	}

	return {
		hasError,
		totalTaskDuration,
		wallClockDuration: sequenceTracker.getDuration(),
	};
}

/**
 * Helper to create step count patches
 */
export function createStepCountPatches(
	transitions: StepCountTransition[],
): Patch[] {
	return transitions.flatMap(({ from, to, count }) => [
		{ path: `steps.${from}`, decrement: count } as Patch,
		{ path: `steps.${to}`, increment: count } as Patch,
	]);
}

/**
 * Helper to check if all sequences before a given index have completed
 */
export function shouldSkipRemainingSequences(
	sequences: Sequence[],
	currentIndex: number,
): boolean {
	return sequences
		.slice(0, currentIndex)
		.some((seq) => seq.status === "failed" || seq.status === "cancelled");
}

/**
 * Helper to calculate remaining step counts for cancellation
 */
export function calculateRemainingSteps(
	sequences: Sequence[],
	fromIndex: number,
): number {
	return sequences
		.slice(fromIndex)
		.reduce((sum, seq) => sum + seq.steps.length, 0);
}

/**
 * Options for act execution
 */
export interface ActExecutorOptions {
	/** Called when the act starts execution */
	onActStart?: () => void | Promise<void>;
	/** Called when a sequence starts */
	onSequenceStart?: (sequence: Sequence, index: number) => void | Promise<void>;
	/** Called when a sequence completes successfully */
	onSequenceComplete?: (
		sequence: Sequence,
		index: number,
		duration: SequenceExecutionResult,
	) => void | Promise<void>;
	/** Called when a sequence fails */
	onSequenceFail?: (
		sequence: Sequence,
		index: number,
		error: unknown,
		duration: SequenceExecutionResult,
	) => void | Promise<void>;
	/** Called when a sequence is skipped due to previous failure */
	onSequenceSkip?: (sequence: Sequence, index: number) => void | Promise<void>;
	/** Called when a step starts */
	onStepStart?: (
		step: Step,
		sequenceIndex: number,
		stepIndex: number,
	) => void | Promise<void>;
	/** Called when a step completes */
	onStepComplete?: (
		step: Step,
		sequenceIndex: number,
		stepIndex: number,
	) => void | Promise<void>;
	/** Called when a step fails */
	onStepError?: (
		step: Step,
		sequenceIndex: number,
		stepIndex: number,
		error: unknown,
	) => void | Promise<void>;
	/** Called when the act completes */
	onActComplete?: (hasError: boolean, duration: number) => void | Promise<void>;
	/** Signal to cancel execution */
	cancelSignal?: { current: boolean };
}

/**
 * Result of act execution
 */
export interface ActExecutorResult {
	hasError: boolean;
	duration: number;
}

/**
 * Core act executor that manages the outer loop of sequence execution
 * Used by both React hooks and Node.js engine implementations
 */
export async function executeAct<TGeneration>(args: {
	act: Act;
	context: ExecutionContext<TGeneration>;
	options: ActExecutorOptions;
}): Promise<ActExecutorResult> {
	const { act, context, options } = args;
	const actTracker = createDurationTracker();
	let hasError = false;

	// Start act execution
	await options.onActStart?.();

	// Execute each sequence
	for (
		let sequenceIndex = 0;
		sequenceIndex < act.sequences.length;
		sequenceIndex++
	) {
		const sequence = act.sequences[sequenceIndex];
		const stepsCount = sequence.steps.length;

		// Check if we should skip due to previous error
		if (hasError) {
			// Cancel remaining steps in this sequence
			await context.patchAdapter.applyPatches(
				context.actId,
				createStepCountPatches([
					createStepCountTransition("queued", "cancelled", stepsCount),
				]),
			);

			// Skip this and all remaining sequences
			for (let i = sequenceIndex; i < act.sequences.length; i++) {
				await options.onSequenceSkip?.(act.sequences[i], i);
			}
			break;
		}

		// Start sequence
		await options.onSequenceStart?.(sequence, sequenceIndex);

		// Move steps from queued to inProgress
		await context.patchAdapter.applyPatches(
			context.actId,
			createStepCountPatches([
				createStepCountTransition("queued", "inProgress", stepsCount),
			]),
		);

		// Execute the sequence
		const result = await executeSequence(sequence, sequenceIndex, context, {
			onStepStart: async (step, stepIndex) => {
				await options.onStepStart?.(step, sequenceIndex, stepIndex);
			},
			onStepComplete: async (step, stepIndex) => {
				await context.patchAdapter.applyPatches(
					context.actId,
					createStepCountPatches([
						createStepCountTransition("inProgress", "completed", 1),
					]),
				);
				await options.onStepComplete?.(step, sequenceIndex, stepIndex);
			},
			onStepError: async (step, stepIndex, error) => {
				await context.patchAdapter.applyPatches(
					context.actId,
					createStepCountPatches([
						createStepCountTransition("inProgress", "failed", 1),
					]),
				);
				await options.onStepError?.(step, sequenceIndex, stepIndex, error);
			},
			onSequenceError: async (error) => {
				hasError = true;
				await options.onSequenceFail?.(sequence, sequenceIndex, error, result);
			},
			onSequenceComplete: async () => {
				await options.onSequenceComplete?.(sequence, sequenceIndex, result);
			},
			cancelSignal: options.cancelSignal,
		});

		hasError = result.hasError;
	}

	// Complete act execution
	const duration = actTracker.getDuration();
	await options.onActComplete?.(hasError, duration);

	return {
		hasError,
		duration,
	};
}
