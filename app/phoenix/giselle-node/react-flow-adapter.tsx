import type { Node, NodeProps, NodeTypes } from "@xyflow/react";
import type { FC } from "react";
import { GiselleNode } from "./components";
import type { prompt, textGenerator } from "./types";

type TextGeneratorAsReactFlowNode = Node<typeof textGenerator, "textGerator">;
type PromptAsReactFlowNode = Node<typeof prompt, "prompt">;

type ReactFlowNode = TextGeneratorAsReactFlowNode | PromptAsReactFlowNode;

export const ReactFlowNode: FC<NodeProps<ReactFlowNode>> = ({ data }) => {
	return <GiselleNode {...data} />;
};

const nodeTypes: NodeTypes = {
	textGerator: ReactFlowNode,
	prompt: ReactFlowNode,
};
