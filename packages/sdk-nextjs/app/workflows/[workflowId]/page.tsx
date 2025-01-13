"use client";
import { workflowId } from "@/lib/workflow-data";
import { useWorkflowDesigner } from "@/lib/workflow-designer";
import { useParams } from "next/navigation";
import { z } from "zod";

const Params = z.object({
	workflowId: workflowId.schema,
});

export default function Page() {
	const unsafeParams = useParams();
	const params = Params.parse(unsafeParams);
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
				{data.nodes.map((node) => (
					<div key={node.id}>{node.name}</div>
				))}
			</div>
		</div>
	);
}
