import { nodeClasses } from "./classes";
import { factory } from "./factory";
export { NodeClassCategory } from "./type";

export const nodeFactory = factory(nodeClasses);

export function assertNodeClassName(
	name: string | number | symbol,
): asserts name is keyof typeof nodeClasses {
	if (!(name in nodeClasses)) {
		throw new Error(`Invalid class name: ${String(name)}`);
	}
}
