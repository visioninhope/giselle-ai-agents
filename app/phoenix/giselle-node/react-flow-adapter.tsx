import type { Node, NodeProps, NodeTypes } from "@xyflow/react";
import type { FC } from "react";
import type { promptBlueprint, textGeneratorBlueprint } from "./blueprints";
import { GiselleNode } from "./components";

type TextGeneratorAsReactFlowNode = Node<
	typeof textGeneratorBlueprint,
	"textGerator"
>;
type PromptAsReactFlowNode = Node<typeof promptBlueprint, "prompt">;

type ReactFlowNode = TextGeneratorAsReactFlowNode | PromptAsReactFlowNode;

export const ReactFlowNode: FC<NodeProps<ReactFlowNode>> = ({ data }) => {
	return <GiselleNode {...data} />;
};

const nodeTypes: NodeTypes = {
	textGerator: ReactFlowNode,
	prompt: ReactFlowNode,
};
