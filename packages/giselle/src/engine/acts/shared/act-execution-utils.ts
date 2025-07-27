import type { Act, ActId, Sequence, Step } from "../../../concepts/act";
import type {
	Generation,
	GenerationId,
	GenerationStatus,
} from "../../../concepts/generation";
import { patches } from "../object/patch-creators";
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

export interface GenerationAdapter {
	startGeneration(
		generationId: GenerationId,
		callbacks?: {
			onCompleted?: () => void | Promise<void>;
			onFailed?: (generation: Generation) => void | Promise<void>;
		},
	): Promise<void>;
	stopGeneration(generationId: GenerationId): Promise<void>;
}

export interface SequenceExecutionResult {
	hasError: boolean;
	totalTaskDuration: number;
	wallClockDuration: number;
}

interface SequenceExecutionOptions {
	sequence: Sequence;
	startGeneration(
		generationId: GenerationId,
		callbacks?: {
			onCompleted?: () => void | Promise<void>;
			onFailed?: (generation: Generation) => void | Promise<void>;
		},
	): Promise<void>;
	onSequenceStart?: (sequence: Sequence) => void | Promise<void>;
	onSequenceComplete?: (sequence: Sequence) => void | Promise<void>;
	onSequenceError?: (
		error: unknown,
		sequence: Sequence,
	) => void | Promise<void>;
	onStepStart?: (step: Step, stepIndex: number) => Promise<void>;
	onStepError?: (
		step: Step,
		stepIndex: number,
		error: unknown,
	) => Promise<void>;
	onStepComplete?: (step: Step, stepIndex: number) => Promise<void>;
}

export async function executeSequence(
	options: SequenceExecutionOptions,
): Promise<SequenceExecutionResult> {
	const sequenceTracker = createDurationTracker();
	let totalTaskDuration = 0;
	let hasError = false;

	// Start sequence
	await options.onSequenceStart?.(options.sequence);

	// Execute all steps in parallel
	await Promise.all(
		options.sequence.steps.map(async (step, stepIndex) => {
			// @todo
			// if (options?.cancelSignal?.current) {
			// 	return;
			// }

			const stepTracker = createDurationTracker();

			try {
				await options.onStepStart?.(step, stepIndex);

				// @todo
				// if (options?.cancelSignal?.current) {
				// 	return;
				// }

				await options.startGeneration(step.generationId, {
					onCompleted: async () => {
						const duration = stepTracker.getDuration();
						totalTaskDuration += duration;
						await options?.onStepComplete?.({ ...step, duration }, stepIndex);
					},
					onFailed: async (failedGeneration) => {
						hasError = true;
						const duration = stepTracker.getDuration();
						totalTaskDuration += duration;
						await options.onStepError?.(
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
				await options.onStepError?.({ ...step, duration }, stepIndex, error);
			}
		}),
	);

	// Handle sequence completion
	if (hasError) {
		await options.onSequenceError?.(new Error("Sequence execution failed"), {
			...options.sequence,
			duration: {
				totalTask: totalTaskDuration,
				wallClock: sequenceTracker.getDuration(),
			},
		});
	} else {
		await options.onSequenceComplete?.({
			...options.sequence,
			duration: {
				totalTask: totalTaskDuration,
				wallClock: sequenceTracker.getDuration(),
			},
		});
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

export type ActExecutorOptions = Pick<
	SequenceExecutionOptions,
	"startGeneration"
> & {
	act: Act;
	applyPatches(actId: ActId, patches: Patch[]): Promise<void>;
	onActStart?: () => void | Promise<void>;
	onActComplete?: (hasError: boolean, duration: number) => void | Promise<void>;
	onSequenceSkip?: (sequence: Sequence, index: number) => void | Promise<void>;
	onSequenceStart?: (sequence: Sequence, index: number) => void | Promise<void>;
	onSequenceComplete?: (
		sequence: Sequence,
		index: number,
	) => void | Promise<void>;
	onSequenceError?: (
		sequence: Sequence,
		index: number,
		error: unknown,
	) => void | Promise<void>;
	onStepStart?: (
		step: Step,
		sequenceIndex: number,
		stepIndex: number,
	) => void | Promise<void>;
	onStepComplete?: (
		step: Step,
		sequenceIndex: number,
		stepIndex: number,
	) => void | Promise<void>;
	onStepError?: (
		step: Step,
		sequenceIndex: number,
		stepIndex: number,
		error: unknown,
	) => void | Promise<void>;
};

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
export async function executeAct(
	opts: ActExecutorOptions,
): Promise<ActExecutorResult> {
	const actTracker = createDurationTracker();
	let hasError = false;
	// Start act execution
	await opts.onActStart?.();

	// Set act status to inProgress
	await opts.applyPatches(opts.act.id, [patches.status.set("inProgress")]);

	// Execute each sequence
	for (
		let sequenceIndex = 0;
		sequenceIndex < opts.act.sequences.length;
		sequenceIndex++
	) {
		const sequence = opts.act.sequences[sequenceIndex];
		const stepsCount = sequence.steps.length;

		// Check if we should skip due to previous error
		if (hasError) {
			// Cancel remaining steps in this sequence
			await opts.applyPatches(
				opts.act.id,
				createStepCountPatches([
					createStepCountTransition("queued", "cancelled", stepsCount),
				]),
			);

			// Skip this and all remaining sequences
			for (let i = sequenceIndex; i < opts.act.sequences.length; i++) {
				await opts.onSequenceSkip?.(opts.act.sequences[i], i);
			}
			break;
		}

		// Set sequence status to running
		await opts.applyPatches(opts.act.id, [
			patches.sequences(sequenceIndex).status.set("running"),
		]);

		// Notify sequence start
		await opts.onSequenceStart?.(sequence, sequenceIndex);

		// Move steps from queued to inProgress
		await opts.applyPatches(
			opts.act.id,
			createStepCountPatches([
				createStepCountTransition("queued", "inProgress", stepsCount),
			]),
		);

		// Execute the sequence
		const result = await executeSequence({
			sequence,
			startGeneration: opts.startGeneration,
			onStepStart: async (step, stepIndex) => {
				// Set step status to running
				await opts.applyPatches(opts.act.id, [
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.status.set("running"),
				]);
				await opts.onStepStart?.(step, sequenceIndex, stepIndex);
			},
			onStepComplete: async (step, stepIndex) => {
				// Update step counts and durations
				await opts.applyPatches(opts.act.id, [
					...createStepCountPatches([
						createStepCountTransition("inProgress", "completed", 1),
					]),
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
				await opts.onStepComplete?.(step, sequenceIndex, stepIndex);
			},
			onStepError: async (step, stepIndex, error) => {
				// Update step counts, durations, and add error annotation
				const errorPatches = [
					...createStepCountPatches([
						createStepCountTransition("inProgress", "failed", 1),
					]),
					patches.duration.totalTask.increment(step.duration),
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.status.set("failed"),
					patches
						.sequences(sequenceIndex)
						.steps(stepIndex)
						.duration.set(step.duration),
					patches
						.sequences(sequenceIndex)
						.duration.totalTask.increment(step.duration),
				];

				errorPatches.push(
					patches.annotations.push([
						{
							level: "error" as const,
							message: error instanceof Error ? error.message : "Unknown error",
							sequenceId: sequence.id,
							stepId: step.id,
						},
					]),
				);

				await Promise.all([
					opts.applyPatches(opts.act.id, errorPatches),
					opts.onStepError?.(step, sequenceIndex, stepIndex, error),
				]);
			},
			onSequenceError: async (error, sequence) => {
				hasError = true;
				// Set sequence status to failed and duration
				await opts.applyPatches(opts.act.id, [
					patches.sequences(sequenceIndex).status.set("failed"),
					patches
						.sequences(sequenceIndex)
						.duration.wallClock.set(sequence.duration.wallClock),
				]);
				await opts.onSequenceError?.(sequence, sequenceIndex, error);
			},
			onSequenceComplete: async (completeSequence) => {
				// Set sequence status to completed and duration
				await opts.applyPatches(opts.act.id, [
					patches.sequences(sequenceIndex).status.set("completed"),
					patches
						.sequences(sequenceIndex)
						.duration.wallClock.set(completeSequence.duration.wallClock),
				]);
				await opts.onSequenceComplete?.(completeSequence, sequenceIndex);
			},
		});

		hasError = result.hasError;
	}

	// Complete act execution
	const duration = actTracker.getDuration();

	// Set final act status and duration
	await opts.applyPatches(opts.act.id, [
		patches.status.set(hasError ? "failed" : "completed"),
		patches.duration.wallClock.set(duration),
	]);

	await opts.onActComplete?.(hasError, duration);

	return {
		hasError,
		duration,
	};
}
