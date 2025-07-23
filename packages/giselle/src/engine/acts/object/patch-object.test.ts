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
			const result = patchAct(act, { path: "status", set: "completed" });

			expect(result.status).toBe("completed");
			expect(act.status).toBe("inProgress"); // Original should be unchanged
		});

		it("should update trigger field", () => {
			const act = createTestAct();
			const result = patchAct(act, { path: "trigger", set: "github" });

			expect(result.trigger).toBe("github");
		});
	});

	describe("number patching", () => {
		it("should set number value", () => {
			const act = createTestAct();
			const result = patchAct(act, { path: "steps.queued", set: 5 });

			expect(result.steps.queued).toBe(5);
		});

		it("should increment number value", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				path: "steps.completed",
				increment: 3,
			});

			expect(result.steps.completed).toBe(3);
		});

		it("should decrement number value", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				path: "steps.inProgress",
				decrement: 1,
			});

			expect(result.steps.inProgress).toBe(0);
		});
	});

	describe("array patching", () => {
		it("should push to annotations array", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				path: "annotations",
				push: [
					{ level: "info", message: "Test annotation" },
					{ level: "warning", message: "Another annotation" },
				],
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
				path: "annotations",
				set: [{ level: "error", message: "Error occurred" }],
			});

			expect(result.annotations).toHaveLength(1);
			expect(result.annotations[0].level).toBe("error");
		});
	});

	describe("array index patching", () => {
		it("should update sequence status using array index", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				path: "sequences[0].status",
				set: "completed",
			});

			expect(result.sequences[0].status).toBe("completed");
			expect(result.sequences[1].status).toBe("queued");
		});

		it("should update nested step status using array indices", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				path: "sequences[0].steps[1].status",
				set: "completed",
			});

			expect(result.sequences[0].steps[1].status).toBe("completed");
			expect(result.sequences[0].steps[0].status).toBe("queued");
			expect(result.sequences[0].steps[2].status).toBe("queued");
		});

		it("should update step name using array indices", () => {
			const act = createTestAct();
			const result = patchAct(act, {
				path: "sequences[0].steps[2].name",
				set: "Updated Step 3",
			});

			expect(result.sequences[0].steps[2].name).toBe("Updated Step 3");
		});
	});

	describe("multiple patches", () => {
		it("should apply multiple patches in one call", () => {
			const act = createTestAct();
			const result = patchAct(
				act,
				{ path: "status", set: "completed" },
				{ path: "steps.completed", increment: 2 },
				{ path: "steps.inProgress", decrement: 1 },
				{ path: "sequences[0].status", set: "running" },
			);

			expect(result.status).toBe("completed");
			expect(result.steps.completed).toBe(2);
			expect(result.steps.inProgress).toBe(0);
			expect(result.sequences[0].status).toBe("running");
		});

		it("should handle complex nested patches", () => {
			const act = createTestAct();
			const result = patchAct(
				act,
				{ path: "duration.wallClock", increment: 50 },
				{ path: "duration.totalTask", set: 75 },
				{ path: "usage.totalTokens", decrement: 5 },
			);

			expect(result.duration.wallClock).toBe(150);
			expect(result.duration.totalTask).toBe(75);
			expect(result.usage.totalTokens).toBe(25);
		});
	});

	describe("dynamic paths", () => {
		it("should handle dynamic array indices", () => {
			const act = createTestAct();
			const sequenceIndex = 0;
			const stepIndex = 1;

			const result = patchAct(
				act,
				{ path: "steps.inProgress", increment: 2 },
				{ path: "steps.queued", decrement: 2 },
				{ path: `sequences[${sequenceIndex}].status`, set: "running" },
				{
					path: `sequences[${sequenceIndex}].steps[${stepIndex}].status`,
					set: "completed",
				},
			);

			expect(result.steps.inProgress).toBe(3);
			expect(result.steps.queued).toBe(-2);
			expect(result.sequences[0].status).toBe("running");
			expect(result.sequences[0].steps[1].status).toBe("completed");
		});

		it("should handle computed paths", () => {
			const act = createTestAct();
			const patches = [0, 1, 2].map((idx) => ({
				path: `sequences[0].steps[${idx}].status`,
				set: "completed" as const,
			}));

			const result = patchAct(act, ...patches);

			expect(result.sequences[0].steps[0].status).toBe("completed");
			expect(result.sequences[0].steps[1].status).toBe("completed");
			expect(result.sequences[0].steps[2].status).toBe("completed");
		});
	});

	describe("edge cases", () => {
		it("should handle empty patches", () => {
			const act = createTestAct();
			const result = patchAct(act);

			expect(result).toEqual(act);
			expect(result).not.toBe(act); // Should be a clone
		});

		it("should throw error for invalid path", () => {
			const act = createTestAct();
			expect(() => {
				patchAct(act, { path: "", set: "value" });
			}).toThrow('Invalid path: ""');
		});

		it("should throw error for non-existent path", () => {
			const act = createTestAct();
			expect(() => {
				patchAct(act, { path: "nonexistent.field", set: "value" });
			}).toThrow('Path not found: "nonexistent.field"');
		});

		it("should throw error when incrementing non-number", () => {
			const act = createTestAct();
			expect(() => {
				patchAct(act, { path: "status", increment: 1 });
			}).toThrow('Cannot increment non-number at path: "status"');
		});

		it("should throw error when pushing to non-array", () => {
			const act = createTestAct();
			expect(() => {
				patchAct(act, { path: "status", push: ["item"] });
			}).toThrow('Cannot push to non-array at path: "status"');
		});
	});

	describe("immutability", () => {
		it("should maintain immutability", () => {
			const act = createTestAct();
			const original = structuredClone(act);

			patchAct(
				act,
				{ path: "status", set: "completed" },
				{ path: "steps.completed", increment: 5 },
				{ path: "sequences[0].status", set: "completed" },
			);

			expect(act).toEqual(original); // Original should remain unchanged
		});
	});
});
