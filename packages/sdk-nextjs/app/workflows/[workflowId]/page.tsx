"use client";
import { useWorkflowDesigner } from "@/lib/workflow-designer";
import { Node } from "@/lib/workflow-designer/ui";

export default function Page() {
	const { data, addTextGenerationNode } = useWorkflowDesigner();

	return (
		<div className="grid grid-cols-[250px_1fr]">
			<div>
				<button
					type="button"
					onClick={() => {
						addTextGenerationNode({ name: "test-node" });
					}}
				>
					add text generation node
				</button>
				<button type="button">add text node</button>
				<p>{data.connections.size}</p>
			</div>
			<div>
				{Array.from(data.nodes).map(([nodeId, node]) => (
					<Node key={nodeId} data={node} />
				))}
			</div>
		</div>
	);
}
