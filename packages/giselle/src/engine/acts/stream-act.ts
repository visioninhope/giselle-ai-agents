import * as z from "zod/v4";
import { Act } from "../../concepts/act";
import type { ActId } from "../../concepts/identifiers";
import type { GiselleEngineContext } from "../types";
import { getAct } from "./get-act";
export const StreamData = z.object({
	act: Act,
});
export type StreamData = z.infer<typeof StreamData>;

const ConnectedEvent = z.object({
	type: z.literal("connected"),
});
const DataEvent = z.object({
	type: z.literal("data"),
	data: StreamData,
});
const EndEvent = z.object({
	type: z.literal("end"),
});
const ErrorEvent = z.object({
	type: z.literal("error"),
	message: z.string(),
});

export const StreamEvent = z.discriminatedUnion("type", [
	ConnectedEvent,
	DataEvent,
	EndEvent,
	ErrorEvent,
]);

function createDataHash(data: StreamData): string {
	// Create a simple hash of the data to detect changes
	return JSON.stringify({
		actUpdatedAt: data.act.updatedAt,
	});
}

export function formatStreamData(event: z.infer<typeof StreamEvent>): string {
	return `data: ${JSON.stringify(event)}\n\n`;
}

export function streamAct(args: {
	actId: ActId;
	context: GiselleEngineContext;
}) {
	const encoder = new TextEncoder();

	return new ReadableStream({
		async start(controller) {
			let lastDataHash = "";
			let polling = true;
			let lastFetchedData: StreamData | null = null;

			// Send connection established event
			controller.enqueue(
				encoder.encode(formatStreamData({ type: "connected" })),
			);

			// Function to send data updates
			const sendUpdate = async () => {
				// Early exit if not polling or controller is closed
				if (!polling || controller.desiredSize === null) {
					return;
				}

				try {
					lastFetchedData = { act: await getAct(args) }; // Store fetched data
					const currentHash = createDataHash(lastFetchedData);

					// Only send if data has changed or this is the first fetch
					if (currentHash !== lastDataHash) {
						lastDataHash = currentHash;

						// Check if act is completed
						const isCompleted = lastFetchedData.act.status === "completed";
						const payload = StreamEvent.parse({
							type: isCompleted ? "complete" : "data",
							data: lastFetchedData,
						});

						controller.enqueue(encoder.encode(formatStreamData(payload)));
					}
				} catch (error) {
					console.error("Error fetching act and generations:", error);
					lastFetchedData = null; // Clear data on error

					// Only send error if controller is still active
					try {
						controller.enqueue(
							encoder.encode(
								formatStreamData({
									type: "error",
									message: "Failed to fetch data",
								}),
							),
						);
					} catch {
						// Ignore if controller is already closed
					}
				}
			};

			// Unified cleanup function
			const cleanup = () => {
				polling = false;
				clearInterval(pollIntervalId);

				// Send end message and close if controller is still active
				if (controller.desiredSize !== null) {
					controller.enqueue(encoder.encode(formatStreamData({ type: "end" })));
					controller.close();
				}
			};

			// Unified polling function
			const poll = async () => {
				if (!polling || controller.desiredSize === null) {
					return;
				}

				await sendUpdate();

				// Check if polling should stop using already fetched data
				if (lastFetchedData && lastFetchedData.act.status === "completed") {
					cleanup();
				}
			};

			// Execute immediately first, then set up regular polling
			await poll();

			// Create polling interval for subsequent executions
			const pollIntervalId = setInterval(poll, 500);

			// Wait for 20 minutes before cleanup
			setTimeout(cleanup, 20 * 60 * 1000);
		},
	});
}
