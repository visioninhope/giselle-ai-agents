import type { NodeBase } from "@giselle-sdk/data-type";
import type { Input } from "./types";

export function filterInputs<T extends NodeBase>(
	inputs: Input[],
	guardFn: (args: unknown) => args is T,
): Input<T>[] {
	const tmpInputs: Input<T>[] = [];
	for (const input of inputs) {
		if (!guardFn(input.node)) {
			continue;
		}
		tmpInputs.push({
			...input,
			node: input.node,
		});
	}
	return tmpInputs;
}
