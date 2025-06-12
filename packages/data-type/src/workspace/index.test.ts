import { expect, test } from "vitest";
import { Workspace, generateInitialWorkspace } from ".";
test("test", () => {
	const parse = Workspace.safeParse(generateInitialWorkspace());
	expect(parse.success).toBe(true);
	expect(Array.isArray(parse.data?.secrets)).toBeTruthy();
});
