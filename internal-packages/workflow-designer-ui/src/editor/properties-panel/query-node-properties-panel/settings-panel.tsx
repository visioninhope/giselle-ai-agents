import type { QueryNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "@giselle-sdk/giselle-engine/react";
import { Slider } from "../../../ui/slider";

export function SettingsPanel({ node }: { node: QueryNode }) {
	const { updateNodeDataContent } = useWorkflowDesigner();

	return (
		<div className="flex flex-col gap-[34px]">
			<div className="grid grid-cols-2 gap-[24px]">
				<Slider
					label="Max Results"
					value={node.content.maxResults ?? 10}
					max={100}
					min={1}
					step={1}
					onChange={(value) => {
						updateNodeDataContent(node, {
							...node.content,
							maxResults: value,
						});
					}}
				/>
				<Slider
					label="Similarity Threshold"
					value={node.content.similarityThreshold ?? 0}
					max={1}
					min={0}
					step={0.01}
					onChange={(value) => {
						updateNodeDataContent(node, {
							...node.content,
							similarityThreshold: value === 0 ? undefined : value,
						});
					}}
				/>
			</div>
		</div>
	);
}
