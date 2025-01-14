import type { NodeData } from "@/lib/workflow-data";
import { useNode } from "../workflow-designer-context";

export function Node({ data }: { data: NodeData }) {
	const { updateData, addConnection } = useNode(data.id);
	if (data.content.type === "textGeneration") {
		return (
			<div>
				<p>Hello,{data.name}!!</p>
				<p>{data.content.prompt}</p>
				<button
					type="button"
					onClick={() => {
						const handle = addConnection({
							label: "new source",
							sourceNode: data,
						});
						updateData({
							content: {
								...data.content,
								sources: [...data.content.sources, handle],
							},
						});
					}}
				>
					add source
				</button>

				<p>{data.content.sources.length}</p>
			</div>
		);
	}
	return (
		<div>
			<p>Hello,{data.name}</p>
			<p>{data.content.sources.length}</p>
			<button type="button">add source</button>
		</div>
	);
}
