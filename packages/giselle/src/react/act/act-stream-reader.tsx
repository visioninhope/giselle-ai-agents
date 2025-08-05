"use client";

import { useEffect } from "react";
import type { ActId } from "../../concepts/act";
import { type StreamData, StreamEvent } from "../../engine/acts/stream-act";

export function ActStreamReader({
	actId,
	onUpdateAction,
	children,
}: React.PropsWithChildren<{
	actId: ActId;
	onUpdateAction: (data: StreamData) => void;
}>) {
	useEffect(() => {
		let cancelled = false;
		const controller = new AbortController();

		const obtainAPIResponse = async () => {
			try {
				// Initiate the first call to connect to SSE API
				const apiResponse = await fetch(`/api/giselle/streamAct`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ actId }),
					signal: controller.signal,
				});

				if (!apiResponse.body || cancelled) return;

				// To recieve data as a string we use TextDecoderStream class in pipethrough
				const reader = apiResponse.body
					.pipeThrough(new TextDecoderStream())
					.getReader();

				try {
					while (!cancelled) {
						const { value, done } = await reader.read();
						if (done || cancelled) break;

						const trimmed = value.trim();
						if (!trimmed.startsWith("data:")) continue;

						const json = trimmed.slice(5).trim();
						const parsed = JSON.parse(json);

						const streamEvent = StreamEvent.parse(parsed);
						if (cancelled) break;

						switch (streamEvent.type) {
							case "connected":
								if (process.env.NODE_ENV === "development") {
									console.log(`Stream event: ${streamEvent.type}`);
								}
								break;
							case "data":
								onUpdateAction(streamEvent.data);
								break;
							case "end":
								break;
							case "error":
								throw new Error(streamEvent.message);
							default: {
								const _exhaustiveCheck: never = streamEvent;
								throw new Error(
									`Unhandled stream event type: ${_exhaustiveCheck}`,
								);
							}
						}
					}
				} finally {
					await reader.cancel();
				}
			} catch (error) {
				if (
					!cancelled &&
					error instanceof Error &&
					error.name !== "AbortError"
				) {
					console.error("Stream error:", error);
				} else if (!cancelled && !(error instanceof Error)) {
					console.error("Stream error:", error);
				}
			}
		};

		obtainAPIResponse();

		// Cleanup function
		return () => {
			cancelled = true;
			controller.abort();
		};
	}, [actId, onUpdateAction]);

	return children;
}
