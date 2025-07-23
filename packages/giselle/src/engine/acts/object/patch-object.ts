import type { Act } from "../../../concepts/act";

// Simple patch types - one for each operation
export type SimplePatch =
	| { path: string; set: unknown }
	| { path: string; increment: number }
	| { path: string; decrement: number }
	| { path: string; push: unknown[] };

export function patchAct(act: Act, ...patches: SimplePatch[]): Act {
	const result = structuredClone(act);

	for (const patch of patches) {
		// Support both [0] and .0 notation for arrays
		const normalizedPath = patch.path.replace(/\[(\d+)\]/g, ".$1");
		const keys = normalizedPath.split(".");
		const lastKey = keys.pop();

		if (!lastKey) {
			throw new Error(`Invalid path: "${patch.path}"`);
		}

		// Navigate to the target object
		// biome-ignore lint/suspicious/noExplicitAny: internal navigation
		let target: any = result;
		for (const key of keys) {
			target = target[key];
			if (target === undefined) {
				throw new Error(`Path not found: "${patch.path}"`);
			}
		}

		// Apply the patch
		if ("set" in patch) {
			target[lastKey] = patch.set;
		} else if ("increment" in patch) {
			if (typeof target[lastKey] !== "number") {
				throw new Error(`Cannot increment non-number at path: "${patch.path}"`);
			}
			target[lastKey] += patch.increment;
		} else if ("decrement" in patch) {
			if (typeof target[lastKey] !== "number") {
				throw new Error(`Cannot decrement non-number at path: "${patch.path}"`);
			}
			target[lastKey] -= patch.decrement;
		} else if ("push" in patch) {
			if (!Array.isArray(target[lastKey])) {
				throw new Error(`Cannot push to non-array at path: "${patch.path}"`);
			}
			target[lastKey].push(...patch.push);
		}
	}

	return result;
}
