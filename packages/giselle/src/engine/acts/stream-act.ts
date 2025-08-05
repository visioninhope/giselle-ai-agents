import z from "zod/v4";
import { Act } from "../../concepts/act";
import { Generation } from "../../concepts/generation";
import type { ActId } from "../../concepts/identifiers";
import { getGeneration } from "../generations/get-generation";
import type { GiselleEngineContext } from "../types";
import { getAct } from "./get-act";

export const StreamData = z.object({
	act: Act,
	generations: z.array(Generation),
});
export type StreamData = z.infer<typeof StreamData>;

const DataEvent = z.object({
	type: z.literal("data"),
	data: StreamData,
});
const CompleteEvent = z.object({
	type: z.literal("complete"),
	data: StreamData,
});

export const StreamEvent = z.discriminatedUnion("type", [
	DataEvent,
	CompleteEvent,
]);

async function fetchActAndGenerations(args: {
	actId: ActId;
	context: GiselleEngineContext;
}): Promise<StreamData> {
	const act = await getAct({ actId: args.actId, context: args.context });
	const generations: Generation[] = await Promise.all(
		act.sequences.flatMap((sequence) =>
			sequence.steps.map((step) =>
				getGeneration({
					context: args.context,
					generationId: step.generationId,
					useExperimentalStorage: true,
				}),
			),
		),
	).then((generations) =>
		generations.filter((generation) => generation !== undefined),
	);

	return { act, generations };
}

function createDataHash(data: StreamData): string {
	// Create a simple hash of the data to detect changes
	return JSON.stringify({
		actUpdatedAt: data.act.updatedAt,
		generationsHash: data.generations.map((g) => ({
			id: g.id,
			status: g.status,
			// Use different timestamp fields based on generation status
			createdAt: g.createdAt,
			...(g.status === "queued" && "queuedAt" in g && { queuedAt: g.queuedAt }),
			...(g.status === "running" &&
				"startedAt" in g && { startedAt: g.startedAt }),
			...(g.status === "completed" &&
				"completedAt" in g && { completedAt: g.completedAt }),
			...(g.status === "failed" && "failedAt" in g && { failedAt: g.failedAt }),
		})),
	});
}

export interface StreamActOptions {
	signal?: AbortSignal;
	pollInterval?: number;
	maxConnectionTime?: number;
}

export function streamAct(args: {
	actId: ActId;
	context: GiselleEngineContext;
	options?: StreamActOptions;
}) {
	const { actId, context, options = {} } = args;
	const {
		signal,
		pollInterval = 2000,
		maxConnectionTime, // Optional safety measure
	} = options;

	const encoder = new TextEncoder();

	return new ReadableStream({
		async start(controller) {
			let lastDataHash = "";
			let polling = true;

			// Send connection established event
			controller.enqueue(
				encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`),
			);

			// Function to send data updates
			const sendUpdate = async (): Promise<boolean> => {
				// Early exit if not polling or controller is closed
				if (!polling || controller.desiredSize === null) {
					return true; // Stop polling
				}

				try {
					const data = await fetchActAndGenerations({ actId, context });
					const currentHash = createDataHash(data);

					// Only send if data has changed or this is the first fetch
					if (currentHash !== lastDataHash) {
						lastDataHash = currentHash;

						// Check if act is completed
						const isCompleted = data.act.status === "completed";
						const payload = StreamEvent.parse({
							type: isCompleted ? "complete" : "data",
							data,
						});

						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
						);

						// Return true if act is completed to stop polling
						if (isCompleted) {
							return true;
						}
					}

					// Also check for completion even if data hasn't changed
					return data.act.status === "completed";
				} catch (error) {
					console.error("Error fetching act and generations:", error);

					// Only send error if controller is still active
					try {
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({
									type: "error",
									message: "Failed to fetch data",
								})}\n\n`,
							),
						);
					} catch {
						// Ignore if controller is already closed
					}
					return false;
				}
			};

			// Send initial data and check if already completed
			const initiallyCompleted = await sendUpdate();
			if (initiallyCompleted) {
				// Act is already completed, just close the stream
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({ type: "end" })}\n\n`),
				);
				controller.close();
				return;
			}

			// Unified cleanup function
			const cleanup = () => {
				polling = false;
				clearInterval(pollIntervalId);

				// Send end message and close if controller is still active
				if (controller.desiredSize !== null) {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify({ type: "end" })}\n\n`),
					);
					controller.close();
				}
			};

			// Create polling interval
			const pollIntervalId = setInterval(async () => {
				if (!polling || controller.desiredSize === null) {
					clearInterval(pollIntervalId);
					return;
				}

				const isCompleted = await sendUpdate();
				if (isCompleted) {
					cleanup();
				}
			}, pollInterval);

			// Handle client disconnect
			signal?.addEventListener("abort", cleanup);

			// Auto-cleanup after maxConnectionTime if specified (safety measure)
			if (maxConnectionTime) {
				setTimeout(cleanup, maxConnectionTime);
			}
		},
	});
}
