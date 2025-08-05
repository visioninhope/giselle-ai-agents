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
		maxConnectionTime = 10 * 60 * 1000, // 10 minutes
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
			const sendUpdate = async () => {
				try {
					const data = await fetchActAndGenerations({ actId, context });
					const currentHash = createDataHash(data);

					// Only send if data has changed or this is the first fetch
					if (currentHash !== lastDataHash) {
						lastDataHash = currentHash;

						const payload = StreamEvent.parse({
							type: "data",
							data,
						});
						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
						);
					}
				} catch (error) {
					console.error("Error fetching act and generations:", error);
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								type: "error",
								message: "Failed to fetch data",
							})}\n\n`,
						),
					);
				}
			};

			// Send initial data
			await sendUpdate();

			// Set up polling to check for updates
			const pollIntervalId = setInterval(async () => {
				if (!polling) return;
				await sendUpdate();
			}, pollInterval);

			// Cleanup when connection is closed
			const cleanup = () => {
				polling = false;
				clearInterval(pollIntervalId);
				if (!controller.desiredSize || controller.desiredSize <= 0) {
					return;
				}
				try {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify({ type: "end" })}\n\n`),
					);
					controller.close();
				} catch (_error) {
					// Controller may already be closed
				}
			};

			// Handle client disconnect
			signal?.addEventListener("abort", cleanup);

			// Auto-cleanup after a certain time to prevent long-running connections
			setTimeout(cleanup, maxConnectionTime);
		},
	});
}
