import type { NodeId } from "@giselle-sdk/data-type";
import type { UIMessage } from "ai";
import { useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import {
	type CancelledGeneration,
	type CompletedGeneration,
	type CreatedGeneration,
	type FailedGeneration,
	type Generation,
	type GenerationContext,
	isCancelledGeneration,
	isCompletedGeneration,
	isCreatedGeneration,
	isFailedGeneration,
	isRunningGeneration,
	type QueuedGeneration,
	type RunningGeneration,
} from "../../concepts/generation";
import { GenerationId } from "../../concepts/identifiers";
import { useFeatureFlag } from "../feature-flags";
import { useGiselleEngine } from "../use-giselle-engine";
import {
	type CreateAndStartGenerationRunner,
	type CreateGenerationRunner,
	type FetchNodeGenerationsParams,
	GenerationRunnerSystemContext,
	type StartGenerationRunner,
} from "./contexts/generation-runner-system";
import { GenerationRunner } from "./generation-runner";
import {
	arrayEquals,
	waitAndGetGenerationCompleted,
	waitAndGetGenerationFailed,
	waitAndGetGenerationRunning,
} from "./helpers";
import { useGenerationStore } from "./store";

function useNodeGenerationMap(generations: Generation[]) {
	return useMemo(() => {
		const map = new Map<NodeId, Generation[]>();
		for (const generation of generations) {
			if (generation.status === "created") {
				continue;
			}
			const nodeId = generation.context.operationNode.id;
			const list = map.get(nodeId) ?? [];
			list.push(generation);
			map.set(
				nodeId,
				list.sort((a, b) => a.createdAt - b.createdAt),
			);
		}
		return map;
	}, [generations]);
}

export function ZustandBridgeGenerationProvider({
	children,
	generateTextApi = "/api/giselle/generateText",
}: {
	children: React.ReactNode;
	generateTextApi?: string;
}) {
	const client = useGiselleEngine();
	const { experimental_storage } = useFeatureFlag();
	const { generations } = useGenerationStore(
		useShallow((s) => ({
			generations: s.generations,
		})),
	);
	const {
		addGenerationRunner,
		updateGeneration,
		updateMessages: updateMessagesStore,
		// addStopHandler: addStopHandlerStore,
	} = useGenerationStore();

	const stopHandlers = useRef<Record<GenerationId, () => void>>({});
	const generationListener = useRef<Record<GenerationId, Generation>>({});

	const nodeGenerationMap = useNodeGenerationMap(generations);

	const waitForGeneration = useCallback(
		async (
			generationId: GenerationId,
			options?: {
				timeout?: number;
				onStart?: (generation: RunningGeneration) => void;
				onComplete?: (generation: CompletedGeneration) => void;
				onError?: (generation: FailedGeneration) => void;
				onCancel?: (generation: CancelledGeneration) => void;
				onUpdateMessages?: (generation: RunningGeneration) => void;
			},
		) => {
			let generation = generationListener.current[generationId];
			let status = generation.status;
			let messages =
				"messages" in generation ? (generation.messages ?? []) : [];
			const timeoutDuration = options?.timeout || 1000 * 800;
			const startTime = Date.now();

			while (true) {
				if (Date.now() - startTime > timeoutDuration) {
					generation = generationListener.current[generationId];
					const failedGeneration: FailedGeneration = {
						id: generation.id,
						context: generation.context,
						createdAt: generation.createdAt,
						queuedAt:
							"queuedAt" in generation
								? (generation.queuedAt ?? Date.now())
								: Date.now(),
						startedAt:
							"startedAt" in generation
								? (generation.startedAt ?? Date.now())
								: Date.now(),
						status: "failed",
						failedAt: Date.now(),
						messages,
						error: {
							name: "Generation timed out",
							message: "Generation timed out",
							dump: "timeout",
						},
					};
					options?.onError?.(failedGeneration);
					const handler = stopHandlers.current[generation.id];
					handler?.();
					updateGeneration(failedGeneration);
					return;
				}
				generation = generationListener.current[generationId];
				if (status !== generation.status) {
					status = generation.status;
					if (isRunningGeneration(generation)) {
						options?.onStart?.(generation);
					}
					if (isCompletedGeneration(generation)) {
						options?.onComplete?.(generation);
						return generation;
					}
					if (isFailedGeneration(generation)) {
						options?.onError?.(generation);
						return generation;
					}
					if (isCancelledGeneration(generation)) {
						options?.onCancel?.(generation);
						return generation;
					}
				}
				if (
					isRunningGeneration(generation) &&
					!arrayEquals(messages, generation.messages)
				) {
					messages = generation.messages;
					options?.onUpdateMessages?.(generation);
				}
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		},
		[updateGeneration],
	);

	const createGenerationRunner: CreateGenerationRunner = useCallback(
		(generationContext: GenerationContext) => {
			const generationId = GenerationId.generate();
			const createdGeneration: CreatedGeneration = {
				id: generationId,
				context: generationContext,
				status: "created",
				createdAt: Date.now(),
			};
			addGenerationRunner(createdGeneration);
			generationListener.current[createdGeneration.id] = createdGeneration;
			return createdGeneration;
		},
		[addGenerationRunner],
	);

	const startGenerationRunner: StartGenerationRunner = useCallback(
		async (id, options = {}) => {
			const generation = generationListener.current[id];
			console.log(`generation: ${generation.id}`);
			if (!isCreatedGeneration(generation)) {
				return;
			}
			const queuedGeneration: QueuedGeneration = {
				...generation,
				status: "queued",
				queuedAt: Date.now(),
			};
			options.onGenerationQueued?.(queuedGeneration);
			updateGeneration(queuedGeneration);
			await waitForGeneration(generation.id, {
				onStart: options.onGenerationStarted,
				onComplete: options.onGenerationCompleted,
				onUpdateMessages: options.onUpdateMessages,
				onCancel: options.onGenerationCancelled,
				onError: options.onGenerationFailed,
			});
		},
		[updateGeneration, waitForGeneration],
	);

	const createAndStartGenerationRunner: CreateAndStartGenerationRunner =
		useCallback(
			async (generationContext, options = {}) => {
				console.log("Creating and starting generation runner");
				const createdGeneration = createGenerationRunner(generationContext);
				options?.onGenerationCreated?.(createdGeneration);
				console.log("Created generation runner");
				await startGenerationRunner(createdGeneration.id, options);
				console.log("Started generation runner");
			},
			[createGenerationRunner, startGenerationRunner],
		);

	const getGeneration = useCallback(
		(generationId: GenerationId) =>
			useGenerationStore
				.getState()
				.generations.find((g) => g.id === generationId),
		[],
	);

	const updateMessages = useCallback(
		(id: GenerationId, messages: UIMessage[]) => {
			updateMessagesStore(id, messages);
			const targetGeneration = generationListener.current[id];
			if (isRunningGeneration(targetGeneration)) {
				generationListener.current[id] = {
					...targetGeneration,
					messages,
				};
			}
		},
		[updateMessagesStore],
	);

	const updateGenerationStatusToRunning = useCallback(
		async (generationId: GenerationId) => {
			const generation = await waitAndGetGenerationRunning(
				(id) =>
					client.getGeneration({
						generationId: id,
						useExperimentalStorage: experimental_storage,
					}),
				generationId,
			);
			updateGeneration(generation);
			generationListener.current[generationId] = generation;
			return generation;
		},
		[client, experimental_storage, updateGeneration],
	);

	const updateGenerationStatusToComplete = useCallback(
		async (generationId: GenerationId) => {
			const generation = await waitAndGetGenerationCompleted(
				(id) =>
					client.getGeneration({
						generationId: id,
						useExperimentalStorage: experimental_storage,
					}),
				generationId,
			);
			updateGeneration(generation);
			generationListener.current[generationId] = generation;
			return generation;
		},
		[client, experimental_storage, updateGeneration],
	);

	const updateGenerationStatusToFailure = useCallback(
		async (generationId: GenerationId) => {
			const generation = await waitAndGetGenerationFailed(
				(id) =>
					client.getGeneration({
						generationId: id,
						useExperimentalStorage: experimental_storage,
					}),
				generationId,
			);
			updateGeneration(generation);
			generationListener.current[generationId] = generation;
			return generation;
		},
		[client, experimental_storage, updateGeneration],
	);

	const addStopHandler = useCallback(
		(generationId: GenerationId, handler: () => void) => {
			stopHandlers.current[generationId] = handler;
		},
		[],
	);

	const stopGenerationRunner = useCallback(
		async (generationId: GenerationId) => {
			const handler = stopHandlers.current[generationId];
			handler?.();
			await client.cancelGeneration({
				generationId,
				useExperimentalStorage: experimental_storage,
			});
			const generation = generationListener.current[generationId];
			const cancelled: CancelledGeneration = {
				...generation,
				status: "cancelled",
				cancelledAt: Date.now(),
			};
			updateGeneration(cancelled);
		},
		[client, experimental_storage, updateGeneration],
	);

	const contextValue = {
		generateTextApi,
		createGenerationRunner,
		startGenerationRunner,
		createAndStartGenerationRunner,
		getGeneration,
		generations,
		updateGenerationStatusToRunning,
		updateGenerationStatusToComplete,
		updateGenerationStatusToFailure,
		updateMessages,
		nodeGenerationMap,
		addStopHandler,
		stopGenerationRunner,
		addGenerationRunner,
	};

	return (
		<GenerationRunnerSystemContext.Provider value={contextValue}>
			{children}
			{generations.map((generation) => (
				<GenerationRunner key={generation.id} generation={generation} />
			))}
		</GenerationRunnerSystemContext.Provider>
	);
}

export type { FetchNodeGenerationsParams };
