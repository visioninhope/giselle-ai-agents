import type { ZodIssue } from "zod";
import { addOverrideNodes } from "./mods/add-override-nodes";
import { fixTypoAccesorToAccessor } from "./mods/fix-typo-accesor-to-accessor";

export function dataMod(data: unknown, issue: ZodIssue) {
	let modData = data;
	modData = fixTypoAccesorToAccessor(modData, issue);
	modData = addOverrideNodes(modData, issue);
	return modData;
}
