import type { ActionNode, Generation } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { useNodeGenerations, useWorkflowDesigner } from "giselle-sdk/react";
import { useCallback, useEffect, useState } from "react";
import { StackBlicksIcon } from "../../../icons";
import { EmptyState } from "../../../ui/empty-state";
import { GenerationView } from "../../../ui/generation-view";

function Empty({ onRun }: { onRun?: () => void }) {
	return (
		<div className="bg-white-900/10 h-full rounded-[8px] flex justify-center items-center text-black-400">
			<EmptyState
				icon={<StackBlicksIcon />}
				title="No action has been run yet."
				description="Run the action to see the result."
				className="text-black-400"
			>
				{onRun && (
					<button
						type="button"
						onClick={onRun}
						className="flex items-center justify-center px-[24px] py-[12px] mt-[16px] bg-[#141519] text-white rounded-[9999px] border border-white-900/15 transition-all hover:bg-[#1e1f26] hover:border-white-900/25 hover:translate-y-[-1px] cursor-pointer font-hubot font-[500] text-[14px]"
					>
						<span className="mr-[8px] generate-star">✦</span>
						Run Action
					</button>
				)}
				<style jsx>{`
          .generate-star {
            display: inline-block;
          }
          button:hover .generate-star {
            animation: rotateStar 0.7s ease-in-out;
          }
          @keyframes rotateStar {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.5); }
            100% { transform: rotate(360deg) scale(1); }
          }
        `}</style>
			</EmptyState>
		</div>
	);
}

export function GenerationPanel({
	node,
}: {
	node: ActionNode;
}) {
	const { data } = useWorkflowDesigner();
	const { generations } = useNodeGenerations({
		nodeId: node.id,
		origin: { type: "workspace", id: data.id },
	});
	const [currentGeneration, setCurrentGeneration] = useState<
		Generation | undefined
	>();

	useEffect(() => {
		if (generations.length === 0) {
			setCurrentGeneration(undefined);
		} else {
			const latestGeneration = generations[generations.length - 1];
			setCurrentGeneration(latestGeneration);
		}
	}, [generations]);

	if (currentGeneration === undefined) {
		return null;
	}

	return (
		<div className="flex flex-col bg-white-900/10 h-full rounded-[8px] py-[8px]">
			<div
				className={clsx(
					"border-b border-white-400/20 py-[4px] px-[16px] flex items-center gap-[8px]",
					"**:data-header-text:font-[700]",
				)}
			>
				<div className="flex-1 flex items-center gap-[8px]">
					{(currentGeneration.status === "created" ||
						currentGeneration.status === "queued" ||
						currentGeneration.status === "running") && (
						<p data-header-text>Running...</p>
					)}
					{currentGeneration.status === "completed" && (
						<p data-header-text>Result(Beta)</p>
					)}
					{currentGeneration.status === "failed" && (
						<p data-header-text>Error</p>
					)}
					{currentGeneration.status === "cancelled" && (
						<p data-header-text>Result</p>
					)}
				</div>
			</div>
			<div className="flex-1 py-[4px] px-[16px] overflow-y-auto">
				{currentGeneration.outputs?.map((output) => {
					if (output.type !== "generated-text") {
						return null;
					}
					return output.content;
				})}
			</div>
		</div>
	);
}
