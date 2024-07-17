import type { Node } from "@/app/agents/blueprints";
import { useNodeSelection } from "@/app/agents/canvas";
import type { FC } from "react";

type NodeModifyPanelProps = {
	selectedNodes: Node[];
};
export const NodeModifyPanel: FC<NodeModifyPanelProps> = ({
	selectedNodes,
}) => {
	console.log({ selectedNodes });
	return (
		<div className="bg-background/50 border border-border w-[200px] text-sm">
			<div className="px-4 py-1 border-b">
				<p>On Request {selectedNodes.length}</p>
			</div>

			<div className="px-4 py-2 flex flex-col gap-2">
				<ul>
					{selectedNodes.map((node) => (
						<li key={node.id}>{node.class}</li>
					))}
				</ul>
			</div>
		</div>
	);
};
