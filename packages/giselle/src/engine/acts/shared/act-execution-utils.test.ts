import { describe, expect, it, vi } from "vitest";
import type { Act } from "../../../concepts/act";
import { patchAct } from "../object/patch-object";
import { executeAct } from "./act-execution-utils";

function createTestAct(): Act {
	return {
		id: "act-1" as const,
		workspaceId: "wrks-1" as const,
		name: "Test Act",
		status: "inProgress",
		steps: {
			queued: 2,
			inProgress: 0,
			completed: 0,
			warning: 0,
			cancelled: 0,
			failed: 0,
		},
		trigger: "manual",
		duration: { wallClock: 0, totalTask: 0 },
		usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
		createdAt: 0,
		updatedAt: 0,
		annotations: [],
		sequences: [
			{
				id: "sqn-1" as const,
				status: "created",
				duration: { wallClock: 0, totalTask: 0 },
				usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
				steps: [
					{
						id: "stp-1" as const,
						status: "created",
						name: "Step 1",
						generationId: "gen-1" as const,
						duration: 0,
						usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
					},
					{
						id: "stp-2" as const,
						status: "created",
						name: "Step 2",
						generationId: "gen-2" as const,
						duration: 0,
						usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
					},
				],
			},
		],
	};
}

describe("executeAct", () => {
	it("updates act, sequence and step status", async () => {
		vi.useFakeTimers();
		let currentAct = createTestAct();

		const applyPatches = vi.fn((_id: string, patches) => {
			currentAct = patchAct(currentAct, ...patches);
		});

		const startGeneration = vi.fn(async (_id: string, callbacks?) => {
			await vi.advanceTimersByTimeAsync(100);
			await callbacks?.onCompleted?.();
		});

		await executeAct({ act: currentAct, applyPatches, startGeneration });

		expect(currentAct.status).toBe("completed");
		expect(currentAct.steps.queued).toBe(0);
		expect(currentAct.steps.completed).toBe(2);

		expect(currentAct.sequences[0].status).toBe("completed");
		expect(currentAct.sequences[0].steps[0].status).toBe("completed");
		expect(currentAct.sequences[0].steps[1].status).toBe("completed");

		expect(currentAct.duration.wallClock).toBeGreaterThan(0);
		expect(currentAct.duration.totalTask).toBeGreaterThan(0);

		vi.useRealTimers();
	});
});
