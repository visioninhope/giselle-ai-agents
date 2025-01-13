"use client";
import { useWorkflowDesigner } from "@/lib/workflow-designer";

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
			</div>
			<div>
				{Object.entries(data.nodes).map(([nodeId, node]) => (
					<div key={node.id}>{node.name}</div>
				))}
			</div>
		</div>
	);
}
