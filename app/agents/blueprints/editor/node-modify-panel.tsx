import type { Node } from "@/app/agents/blueprints";
import type { FC } from "react";

type NodeModifyPanelProps = {
	selectedNodes: Node[];
};
export const NodeModifyPanel: FC<NodeModifyPanelProps> = ({
	selectedNodes,
}) => {
	return (
		<div className="bg-background/50 border border-border w-[200px] text-sm">
			<div className="px-4 py-1 border-b">
				<p>Properties</p>
			</div>

			<div className="px-4 py-2 flex flex-col gap-2">
				{selectedNodes.length > 1 ? (
					<p>{selectedNodes.length} nodes selected</p>
				) : (
					<NodeModifyPanelInner node={selectedNodes[0]} />
				)}
			</div>
		</div>
	);
};

type NodeModifyPanelInnerProps = {
	node: Node;
};
const NodeModifyPanelInner: FC<NodeModifyPanelInnerProps> = ({ node }) => {
	return <div>{node.className}</div>;
};
