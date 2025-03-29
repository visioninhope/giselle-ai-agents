import type { Output } from "@giselle-sdk/data-type";
import type { ZodIssue } from "zod";
import { getValueAtPath, isObject, setValueAtPath } from "../utils";

export function fixTypoAccesorToAccessor(
	workspaceLike: unknown,
	issue: ZodIssue,
) {
	const lastPath = issue.path[issue.path.length - 1];
	if (lastPath !== "accessor") {
		return workspaceLike;
	}
	if (!isObject(workspaceLike)) {
		return workspaceLike;
	}
	const newValue = { ...workspaceLike };
	const output = getValueAtPath(
		workspaceLike,
		issue.path.slice(0, -1),
	) as unknown as Output;
	setValueAtPath(
		newValue,
		issue.path,
		// @ts-ignore previous field name for data mod: [INSERT PULL REQUEST LINK LATER]
		output.accesor,
	);
	return newValue;
}
