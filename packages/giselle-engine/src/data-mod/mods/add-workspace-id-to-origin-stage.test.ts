import type { $ZodIssue } from "@zod/core";
import { describe, expect, it } from "vitest";
import { addWorkspaceIdToOriginStage } from "./add-workspace-id-to-origin-stage";

describe("addWorkspaceIdToOriginStage", () => {
	it("should add workspaceId to GenerationOriginStage when missing", () => {
		const data = {
			context: {
				origin: {
					type: "stage",
					id: "run-123456",
				},
			},
		};

		const issue: $ZodIssue = {
			code: "invalid_type",
			expected: "string",
			input: "undefined",
			path: ["context", "origin", "workspaceId"],
			message: "Required",
		};

		const result = addWorkspaceIdToOriginStage(data, issue);

		expect(result).toEqual({
			context: {
				origin: {
					type: "stage",
					id: "run-123456",
					workspaceId: "wrks-9999999999999999",
				},
			},
		});
	});

	it("should extract workspaceId from context when available", () => {
		const data = {
			context: {
				origin: {
					type: "studio",
					workspaceId: "wrks-abcdef",
				},
				someOtherField: {
					origin: {
						type: "stage",
						id: "run-123456",
					},
				},
			},
		};

		const issue: $ZodIssue = {
			code: "invalid_type",
			expected: "string",
			input: "undefined",
			path: ["context", "someOtherField", "origin", "workspaceId"],
			message: "Required",
		};

		const result = addWorkspaceIdToOriginStage(data, issue);

		expect(result).toEqual({
			context: {
				origin: {
					type: "studio",
					workspaceId: "wrks-abcdef",
				},
				someOtherField: {
					origin: {
						type: "stage",
						id: "run-123456",
						workspaceId: "wrks-abcdef",
					},
				},
			},
		});
	});

	it("should not modify data when issue is not related to workspaceId", () => {
		const data = {
			context: {
				origin: {
					type: "stage",
					id: "run-123456",
				},
			},
		};

		const issue: $ZodIssue = {
			code: "invalid_type",
			expected: "string",
			input: "undefined",
			path: ["context", "origin", "someOtherField"],
			message: "Required",
		};

		const result = addWorkspaceIdToOriginStage(data, issue);

		expect(result).toBe(data);
	});

	it("should not modify data when path doesn't include origin", () => {
		const data = {
			context: {
				someField: {
					id: "run-123456",
					type: "stage",
				},
			},
		};

		const issue: $ZodIssue = {
			code: "invalid_type",
			expected: "string",
			input: "undefined",
			path: ["context", "someField", "workspaceId"],
			message: "Required",
		};

		const result = addWorkspaceIdToOriginStage(data, issue);

		expect(result).toBe(data);
	});

	it("should not modify data when origin type is not stage", () => {
		const data = {
			context: {
				origin: {
					type: "studio",
					workspaceId: "wrks-123456",
				},
			},
		};

		const issue: $ZodIssue = {
			code: "invalid_type",
			expected: "string",
			input: "undefined",
			path: ["context", "origin", "workspaceId"],
			message: "Required",
		};

		const result = addWorkspaceIdToOriginStage(data, issue);

		expect(result).toBe(data);
	});

	it("should handle non-object data", () => {
		const data = "not an object";

		const issue: $ZodIssue = {
			code: "invalid_type",
			expected: "string",
			input: "undefined",
			path: ["context", "origin", "workspaceId"],
			message: "Required",
		};

		const result = addWorkspaceIdToOriginStage(data, issue);

		expect(result).toBe(data);
	});
});
