"use client";

import { useCallback, useEffect } from "react";
import type { ActId } from "../../concepts/act";
import { type StreamData, StreamEvent } from "../../engine/acts/stream-act";

interface ConsumeOptions {
	onUpdateAction: (data: StreamData) => void;
}

export function ActStreamReader({
	actId,
	onUpdateAction,
}: { actId: ActId } & ConsumeOptions) {
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

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;

			try {
				const trimmed = value.trim();
				if (!trimmed.startsWith("data:")) return;

				const json = trimmed.slice(5).trim();
				const parsed = JSON.parse(json);

				// Handle different event types - some events might not match StreamEvent schema
				if (
					parsed.type === "connected" ||
					parsed.type === "error" ||
					parsed.type === "end"
				) {
					console.log(`Stream event: ${parsed.type}`, parsed);
					return;
				}

				const streamEvent = StreamEvent.parse(parsed);
				switch (streamEvent.type) {
					case "data":
						console.log(streamEvent.data);
						onUpdateAction(streamEvent.data);
						break;
					case "complete":
						onUpdateAction(streamEvent.data);
						break;
					default: {
						const _exhaustiveCheck: never = streamEvent;
						throw new Error(`Unhandled stream event type: ${_exhaustiveCheck}`);
					}
				}
			} catch (e) {
				console.warn("Invalid stream chunk:", e);
			}
		}
	}, [actId, onUpdateAction]);

	useEffect(() => {
		console.log("load");
		obtainAPIResponse();
	}, [obtainAPIResponse]);

	return null;
}
