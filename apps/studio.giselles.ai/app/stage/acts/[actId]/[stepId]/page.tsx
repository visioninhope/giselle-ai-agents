import {
	type ActId,
	defaultName,
	type Step,
	type StepId,
} from "@giselle-sdk/giselle";
import { NodeIcon } from "@giselles-ai/icons/node";
import { notFound } from "next/navigation";
import { giselleEngine } from "@/app/giselle-engine";
import { GenerationView } from "../../../../../../../internal-packages/workflow-designer-ui/src/ui/generation-view";

export default async function ({
	params,
}: {
	params: Promise<{ actId: ActId; stepId: StepId }>;
}) {
	const { actId, stepId } = await params;

	const act = await giselleEngine.getAct({ actId });
	let step: Step | undefined;
	for (const sequence of act.sequences) {
		for (const tmp of sequence.steps) {
			if (tmp.id === stepId) {
				step = tmp;
				break;
			}
		}
		if (step !== undefined) {
			break;
		}
	}
	if (step === undefined) {
		return notFound();
	}
	const generation = await giselleEngine.getGeneration(step.generationId, true);
	if (generation === undefined) {
		return notFound();
	}

	return (
		<div className="flex flex-col w-full">
			<header className="bg-tab-active-background p-[16px] flex items-center">
				<div className="flex items-center gap-[6px]">
					<div className="p-[8px] bg-element-active rounded-[4px]">
						<NodeIcon
							node={generation.context.operationNode}
							className="size-[16px]"
						/>
					</div>
					<div className="flex flex-col">
						<div className="text-[14px]">
							{generation.context.operationNode.name ??
								defaultName(generation.context.operationNode)}
						</div>
						<div className="text text-text-muted text-[10px] flex items-center gap-[4px]">
							<span>gpt-4o</span>
							<div className="size-[2px] rounded-full bg-text-muted" />
							<span>Finished: 07/17/2025, 10:48 AM</span>
						</div>
					</div>
				</div>
			</header>
			<main className="p-[16px] overflow-y-auto">
				<div className="max-w-[600px] mx-auto">
					<GenerationView generation={generation} />
				</div>
			</main>
		</div>
	);
}
