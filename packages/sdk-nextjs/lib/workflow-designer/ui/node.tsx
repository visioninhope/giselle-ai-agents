import type { NodeData } from "@/lib/workflow-data";
import { useNode } from "../workflow-designer-context";

export function Node({ data }: { data: NodeData }) {
	const { updateData } = useNode(data.id);
	if (data.content.type === "textGeneration") {
		return (
			<div>
				<p>Hello,{data.name}</p>
				<p>{data.content.prompt}</p>
				<button
					type="button"
					onClick={() => {
						updateData({
							content: {
								...data.content,
								prompt: "new prompt",
							},
						});
					}}
				>
					add source
				</button>
			</div>
		);
	}
	return (
		<div>
			<p>Hello,{data.name}</p>
			<button type="button">add source</button>
		</div>
	);
}
