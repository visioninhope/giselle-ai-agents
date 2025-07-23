import type { Act } from "../../../concepts/act";

type ActPath = DotPaths<Act>;

type PatchValue<T> = T extends number
	? { increment?: number; decrement?: number; set?: number }
	: T extends string
		? { set: string }
		: T extends Array<infer U>
			? {
					push?: U[];
					set?: U[];
				}
			: never;

export type PatchDelta = {
	[P in ActPath]?: PatchValue<Get<Act, P>>;
};

export function patchAct(act: Act, delta: PatchDelta) {
	const result: Act = structuredClone(act);

	for (const key in delta) {
		const patch = delta[key as ActPath];
		if (!patch) continue;

		// Parse path with array indices support
		const parts = parsePath(key);
		const lastKey = parts.at(-1);
		if (!lastKey) {
			throw new Error(`Invalid dot path: "${key}"`);
		}
		const pathToLast = parts.slice(0, -1);

		// biome-ignore lint: lint/suspicious/noExplicitAny: internal use
		let target: any = result;
		for (const part of pathToLast) {
			if (isArrayIndex(part)) {
				const index = getArrayIndex(part);
				target = target[index];
			} else {
				target = target[part];
			}
		}

		// Handle the last key
		const current = isArrayIndex(lastKey)
			? target[getArrayIndex(lastKey)]
			: target[lastKey];

		const finalKey = isArrayIndex(lastKey) ? getArrayIndex(lastKey) : lastKey;

		if (typeof current === "number" && typeof patch === "object") {
			if ("set" in patch) {
				target[finalKey] = patch.set;
			} else if ("increment" in patch) {
				const inc = patch.increment ?? 0;
				target[finalKey] = current + inc;
			} else if ("decrement" in patch) {
				const dec = patch.decrement ?? 0;
				target[finalKey] = current - dec;
			}
		} else if (typeof current === "string" && typeof patch === "object") {
			if ("set" in patch && patch.set !== undefined) {
				target[finalKey] = patch.set;
			}
		} else if (Array.isArray(current) && typeof patch === "object") {
			if ("set" in patch && patch.set !== undefined) {
				target[finalKey] = patch.set;
			} else {
				const newArray = [...current];

				if ("push" in patch && patch.push) {
					newArray.push(...patch.push);
				}

				target[finalKey] = newArray;
			}
		}
	}

	return result;
}

// Helper functions for array index handling
function parsePath(path: string): string[] {
	const parts: string[] = [];
	let current = "";
	let inBracket = false;

	for (let i = 0; i < path.length; i++) {
		const char = path[i];

		if (char === "[" && !inBracket) {
			if (current) {
				parts.push(current);
				current = "";
			}
			inBracket = true;
			current = "[";
		} else if (char === "]" && inBracket) {
			current += "]";
			parts.push(current);
			current = "";
			inBracket = false;
		} else if (char === "." && !inBracket) {
			if (current) {
				parts.push(current);
				current = "";
			}
		} else {
			current += char;
		}
	}

	if (current) {
		parts.push(current);
	}

	return parts;
}

function isArrayIndex(part: string): boolean {
	return /^\[\d+\]$/.test(part);
}

function getArrayIndex(part: string): number {
	return parseInt(part.slice(1, -1), 10);
}

type IsRecord<T> = T extends Record<string, unknown> ? T : never;
type IsArray<T> = T extends readonly unknown[] ? T : never;

// Helper to generate array index paths like [0], [1], etc.
type ArrayIndexPath = `[${number}]`;

// Helper to handle array paths
type ArrayPaths<T, Prefix extends string = "", Depth extends number = 5> = [
	Depth,
] extends [never]
	? never
	: T extends readonly (infer U)[]
		? U extends Record<string, unknown>
			?
					| `${Prefix}${ArrayIndexPath}`
					| DotPaths<U, `${Prefix}${ArrayIndexPath}.`, Decrement[Depth]>
			: `${Prefix}${ArrayIndexPath}`
		: never;

type DotPaths<T, Prefix extends string = "", Depth extends number = 5> = [
	Depth,
] extends [never]
	? never
	: {
			[K in keyof T]: IsArray<T[K]> extends never
				? IsRecord<T[K]> extends never
					? `${Prefix}${K & string}`
					:
							| `${Prefix}${K & string}`
							| DotPaths<
									IsRecord<T[K]>,
									`${Prefix}${K & string}.`,
									Decrement[Depth]
							  >
				:
						| `${Prefix}${K & string}`
						| ArrayPaths<T[K], `${Prefix}${K & string}.`, Decrement[Depth]>;
		}[keyof T];

type Decrement = [never, 0, 1, 2, 3, 4, 5];

// Updated Get type to handle array indices
type Get<T, Path extends string> = Path extends `${infer K}.${infer R}`
	? K extends `[${string}]`
		? T extends readonly unknown[]
			? Get<T[number], R>
			: never
		: K extends keyof T
			? Get<T[K], R>
			: never
	: Path extends `[${string}]`
		? T extends readonly unknown[]
			? T[number]
			: never
		: Path extends keyof T
			? T[Path]
			: never;
