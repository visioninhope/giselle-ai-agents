import { type Blueprint, type Node, assertNode } from "@/app/agents/blueprints";
import type { NodeDef, NodeType } from "@/app/node-defs";

type AddNodeArgs = {
	id: number;
	nodeType: NodeType;
	nodeDef: NodeDef;
	position: { x: number; y: number };
};
export const createDraftNode = ({
	id,
	nodeType,
	nodeDef,
	position,
}: AddNodeArgs): Node => ({
	id,
	position,
	type: nodeType,
	inputPorts: (nodeDef.inputPorts ?? []).map(({ type, label }, index) => ({
		id: index,
		type: type,
		name: label ?? "",
	})),
	outputPorts: (nodeDef.outputPorts ?? []).map(({ type, label }, index) => ({
		id: index,
		type: type,
		name: label ?? "",
	})),
});

export const execApi = async (blueprint: Blueprint, addNode: Node) => {
	const { node } = await fetch(
		`/agents/${blueprint.agent.urlId}/use-editor/nodes`,
		{
			method: "POST",
			body: JSON.stringify({ node: addNode }),
		},
	).then((res) => res.json());
	assertNode(node);
	return { node };
};
