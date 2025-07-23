import { describe, expect, it } from "vitest";
import type { Act } from "../../../concepts/act";
import { patchAct } from "./patch-object";

describe("patchAct", () => {
	// Helper function to create a minimal Act object for testing
	function createTestAct(): Act {
		return {
			id: "act-test123" as const,
			workspaceId: "wrks-test456" as const,
			status: "inProgress",
			steps: {
				queued: 0,
				inProgress: 1,
				completed: 0,
				warning: 0,
				cancelled: 0,
				failed: 0,
			},
			trigger: "manual",
			duration: {
				wallClock: 100,
				totalTask: 50,
			},
			usage: {
				promptTokens: 10,
				completionTokens: 20,
				totalTokens: 30,
			},
			createdAt: Date.now(),
			updatedAt: Date.now(),
			annotations: [],
			sequences: [
				{
					id: "sqn-001" as const,
					status: "queued",
					steps: [
						{
							id: "stp-001" as const,
							status: "queued",
							name: "Step 1",
							generationId: "gnr-001" as const,
						},
						{
							id: "stp-002" as const,
							status: "running",
							name: "Step 2",
							generationId: "gnr-002" as const,
						},
						{
							id: "stp-003" as const,
							status: "queued",
							name: "Step 3",
							generationId: "gnr-003" as const,
						},
					],
				},
				{
					id: "sqn-002" as const,
					status: "queued",
					steps: [],
				},
			],
		};
	}

	describe("string patching", () => {
		it("should update status field", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				status: { set: "completed" },
			});

			expect(result.status).toBe("completed");
			expect(act.status).toBe("inProgress"); // Original should be unchanged
		});

		it("should update trigger field", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				trigger: { set: "github" },
			});

			expect(result.trigger).toBe("github");
		});
	});

	describe("number patching", () => {
		it("should set number value", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"steps.queued": { set: 5 },
			});

			expect(result.steps.queued).toBe(5);
		});

		it("should increment number value", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"steps.completed": { increment: 3 },
			});

			expect(result.steps.completed).toBe(3);
		});

		it("should decrement number value", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"steps.inProgress": { decrement: 1 },
			});

			expect(result.steps.inProgress).toBe(0);
		});

		it("should handle increment with default value", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"usage.promptTokens": { increment: undefined },
			});

			expect(result.usage.promptTokens).toBe(10); // Should remain unchanged
		});
	});

	describe("array patching", () => {
		it("should push to annotations array", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				annotations: {
					push: [
						{ level: "info", message: "Test annotation" },
						{ level: "warning", message: "Another annotation" },
					],
				},
			});

			expect(result.annotations).toHaveLength(2);
			expect(result.annotations[0]).toEqual({
				level: "info",
				message: "Test annotation",
			});
		});

		it("should set entire array", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				annotations: {
					set: [{ level: "error", message: "Error occurred" }],
				},
			});

			expect(result.annotations).toHaveLength(1);
			expect(result.annotations[0].level).toBe("error");
		});
	});

	describe("array index patching", () => {
		it("should update sequence status using array index", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"sequences.[0].status": { set: "completed" },
			} as any);

			expect(result.sequences[0].status).toBe("completed");
			expect(result.sequences[1].status).toBe("queued");
		});

		it("should update nested step status using array indices", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"sequences.[0].steps.[1].status": { set: "completed" },
			} as any);

			expect(result.sequences[0].steps[1].status).toBe("completed");
			expect(result.sequences[0].steps[0].status).toBe("queued");
			expect(result.sequences[0].steps[2].status).toBe("queued");
		});

		it("should update step name using array indices", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"sequences.[0].steps.[2].name": { set: "Updated Step 3" },
			} as any);

			expect(result.sequences[0].steps[2].name).toBe("Updated Step 3");
		});

		it("should handle multiple array indices in one path", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"sequences.[1].status": { set: "running" },
				"sequences.[0].steps.[0].status": { set: "completed" },
			} as any);

			expect(result.sequences[1].status).toBe("running");
			expect(result.sequences[0].steps[0].status).toBe("completed");
		});
	});

	describe("complex nested patching", () => {
		it("should update multiple nested fields", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"duration.wallClock": { increment: 50 },
				"duration.totalTask": { set: 75 },
				"usage.totalTokens": { decrement: 5 },
			});

			expect(result.duration.wallClock).toBe(150);
			expect(result.duration.totalTask).toBe(75);
			expect(result.usage.totalTokens).toBe(25);
		});

		it("should handle mixed array and object paths", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"sequences.[0].id": { set: "sqn-updated" },
				"steps.completed": { increment: 1 },
			} as any);

			expect(result.sequences[0].id).toBe("sqn-updated");
			expect(result.steps.completed).toBe(1);
		});
	});

	describe("edge cases", () => {
		it("should handle empty delta", () => {
			const act = createTestAct();
			const result = patchAct(act, {});

			expect(result).toEqual(act);
			expect(result).not.toBe(act); // Should be a clone
		});

		it("should skip undefined patches", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				status: undefined as any,
			});

			expect(result).toEqual(act);
		});

		it("should throw error for invalid path", () => {
			const act = createTestAct();
			expect(() => {
				patchAct(act, {
					"": { set: "value" },
				} as any);
			}).toThrow('Invalid dot path: ""');
		});

		it("should handle paths with consecutive dots correctly", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"sequences.[0].steps.[0].status": { set: "failed" },
			} as any);

			expect(result.sequences[0].steps[0].status).toBe("failed");
		});
	});

	describe("type safety", () => {
		it("should maintain type safety for number operations", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				"steps.queued": { increment: 2 },
				"steps.inProgress": { decrement: 1 },
				"steps.completed": { set: 10 },
			});

			expect(result.steps.queued).toBe(2);
			expect(result.steps.inProgress).toBe(0);
			expect(result.steps.completed).toBe(10);
		});

		it("should maintain immutability", () => {
			const act = createTestAct();
			const original = structuredClone(act);

			patchAct(act, {
				status: { set: "completed" },
				"steps.completed": { increment: 5 },
				"sequences.[0].status": { set: "completed" },
			} as any);

			expect(act).toEqual(original); // Original should remain unchanged
		});
	});
});
