import { nodeClasses } from "./classes";
import { createNodeService } from "./service";
import type { NodeClassCategory } from "./type";
export type {
	NodeClassCategory,
	NodeGraph,
	Node,
	Port,
	PortDirection,
} from "./type";
export { portDirection } from "./type";
export { Finder } from "./components/finder";
export { GiselleNode, type GiselleNodeData } from "./components/node";

export const nodeService = createNodeService(nodeClasses);

export function assertNodeClassName(
	name: string | number | symbol,
): asserts name is keyof typeof nodeClasses {
	if (!(name in nodeClasses)) {
		throw new Error(`Invalid class name: ${String(name)}`);
	}
}

export function nodeClassHasCategory(
	name: string,
	category: NodeClassCategory,
): boolean {
	assertNodeClassName(name);
	const categories: NodeClassCategory[] = nodeClasses[name].categories;
	return categories.includes(category);
}
