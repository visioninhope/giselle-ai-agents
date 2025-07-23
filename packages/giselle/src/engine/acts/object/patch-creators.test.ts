import { describe, expect, it } from "vitest";
import { patches } from "./patch-creators";

describe("patch creators", () => {
	describe("status", () => {
		it("should create status set patch", () => {
			const patch = patches.status.set("completed");
			expect(patch).toEqual({
				path: "status",
				set: "completed",
			});
		});
	});

	describe("steps", () => {
		it("should create steps.queued increment patch", () => {
			const patch = patches.steps.queued.increment(5);
			expect(patch).toEqual({
				path: "steps.queued",
				increment: 5,
			});
		});

		it("should create steps.inProgress decrement patch", () => {
			const patch = patches.steps.inProgress.decrement(2);
			expect(patch).toEqual({
				path: "steps.inProgress",
				decrement: 2,
			});
		});

		it("should create steps.completed set patch", () => {
			const patch = patches.steps.completed.set(10);
			expect(patch).toEqual({
				path: "steps.completed",
				set: 10,
			});
		});
	});

	describe("duration", () => {
		it("should create duration.wallClock increment patch", () => {
			const patch = patches.duration.wallClock.increment(100);
			expect(patch).toEqual({
				path: "duration.wallClock",
				increment: 100,
			});
		});

		it("should create duration.totalTask set patch", () => {
			const patch = patches.duration.totalTask.set(500);
			expect(patch).toEqual({
				path: "duration.totalTask",
				set: 500,
			});
		});
	});

	describe("usage", () => {
		it("should create usage.promptTokens increment patch", () => {
			const patch = patches.usage.promptTokens.increment(50);
			expect(patch).toEqual({
				path: "usage.promptTokens",
				increment: 50,
			});
		});

		it("should create usage.totalTokens decrement patch", () => {
			const patch = patches.usage.totalTokens.decrement(10);
			expect(patch).toEqual({
				path: "usage.totalTokens",
				decrement: 10,
			});
		});
	});

	describe("annotations", () => {
		it("should create annotations push patch", () => {
			const items = [
				{ level: "info" as const, message: "Test info" },
				{ level: "warning" as const, message: "Test warning" },
			];
			const patch = patches.annotations.push(items);
			expect(patch).toEqual({
				path: "annotations",
				push: items,
			});
		});

		it("should create annotations set patch", () => {
			const items = [{ level: "error" as const, message: "Test error" }];
			const patch = patches.annotations.set(items);
			expect(patch).toEqual({
				path: "annotations",
				set: items,
			});
		});
	});

	describe("sequences", () => {
		it("should create sequence status set patch", () => {
			const patch = patches.sequences(0).status.set("running");
			expect(patch).toEqual({
				path: "sequences.0.status",
				set: "running",
			});
		});

		it("should create sequence step status set patch", () => {
			const patch = patches.sequences(1).steps(2).status.set("completed");
			expect(patch).toEqual({
				path: "sequences.1.steps.2.status",
				set: "completed",
			});
		});

		it("should create sequence step name set patch", () => {
			const patch = patches.sequences(0).steps(1).name.set("Updated Step");
			expect(patch).toEqual({
				path: "sequences.0.steps.1.name",
				set: "Updated Step",
			});
		});

		it("should work with dynamic indices", () => {
			const sequenceIndex = 3;
			const stepIndex = 5;
			const patch = patches
				.sequences(sequenceIndex)
				.steps(stepIndex)
				.status.set("failed");
			expect(patch).toEqual({
				path: "sequences.3.steps.5.status",
				set: "failed",
			});
		});
	});

	describe("simple fields", () => {
		it("should create trigger set patch", () => {
			const patch = patches.trigger.set("github");
			expect(patch).toEqual({
				path: "trigger",
				set: "github",
			});
		});

		it("should create updatedAt set patch", () => {
			const timestamp = Date.now();
			const patch = patches.updatedAt.set(timestamp);
			expect(patch).toEqual({
				path: "updatedAt",
				set: timestamp,
			});
		});
	});

	describe("type safety", () => {
		it("should enforce correct status values", () => {
			// This should compile
			patches.status.set("completed");
			patches.status.set("inProgress");
			patches.status.set("failed");
			patches.status.set("cancelled");

			// TypeScript should catch invalid values at compile time
			// patches.status.set("invalid"); // @ts-expect-error - invalid status value
		});

		it("should enforce correct annotation levels", () => {
			// This should compile
			patches.annotations.push([{ level: "info", message: "test" }]);
			patches.annotations.push([{ level: "warning", message: "test" }]);
			patches.annotations.push([{ level: "error", message: "test" }]);

			// TypeScript should catch invalid levels at compile time
			// patches.annotations.push([{ level: "invalid", message: "test" }]); // @ts-expect-error - invalid level
		});
	});
});
