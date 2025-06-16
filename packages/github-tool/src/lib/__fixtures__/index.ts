import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadFixture(filename: string): string {
	const fixturePath = join(__dirname, filename);
	return readFileSync(fixturePath, "utf-8");
}

export const PR_1118_DIFF = loadFixture("pr-1118-diff.txt");
