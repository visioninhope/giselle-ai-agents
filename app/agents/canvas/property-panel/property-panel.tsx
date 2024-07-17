import { type Node, useNode } from "@/app/agents/blueprints";
import { findNodeClass, useNodeClasses } from "@/app/node-classes";
import { type FC, useMemo } from "react";
import { match } from "ts-pattern";
import { DynamicOutputPort } from "./dynamic-output-port";

type PropertyPanel = {
	selectedNodes: Node[];
};
export const PropertyPanel: FC<PropertyPanel> = ({ selectedNodes }) => {
	return (
		<div className="bg-background/50 border border-border w-[300px] text-sm">
			<div className="px-4 py-2">
				<p className="font-bold">Properties</p>
			</div>

			<div className="py-2 flex flex-col gap-2">
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
	const nodeClasses = useNodeClasses();
	const nodeClass = useMemo(
		() => findNodeClass(nodeClasses, node.className),
		[nodeClasses, node.className],
	);
	const blueprintNode = useNode(node.id);
	return (
		<div className="flex flex-col gap-2">
			<div>
				{nodeClass?.features?.map((feature) =>
					match(feature)
						.with({ name: "dynamicOutputPort" }, () => (
							<DynamicOutputPort node={blueprintNode} key={feature.name} />
						))
						.exhaustive(),
				)}
			</div>
		</div>
	);
};
