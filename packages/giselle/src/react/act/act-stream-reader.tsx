"use client";

import { useCallback, useEffect } from "react";
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
	const obtainAPIResponse = useCallback(async () => {
		// Initiate the first call to connect to SSE API
		const apiResponse = await fetch(`/api/giselle/streamAct`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ actId }),
		});

		if (!apiResponse.body) return;

		// To recieve data as a string we use TextDecoderStream class in pipethrough
		const reader = apiResponse.body
			.pipeThrough(new TextDecoderStream())
			.getReader();

		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const trimmed = value.trim();
				if (!trimmed.startsWith("data:")) continue;

				const json = trimmed.slice(5).trim();
				const parsed = JSON.parse(json);

				const streamEvent = StreamEvent.parse(parsed);
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
						throw new Error(`Unhandled stream event type: ${_exhaustiveCheck}`);
					}
				}
			}
		} finally {
			await reader.cancel();
		}
	}, [actId, onUpdateAction]);

	useEffect(() => {
		obtainAPIResponse();
	}, [obtainAPIResponse]);

	return children;
}
