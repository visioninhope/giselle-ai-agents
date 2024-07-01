import { cn } from "@/lib/utils";
import { cva } from "cva";
import { CircleCheckIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";
import type { FC } from "react";
import { match } from "ts-pattern";
import type { Run, Step } from "./run";

const stepListItemVariant = cva({
	base: "flex items-center justify-between ",
	variants: {
		status: {
			idle: "text-muted-foreground",
			running: "text-foreground",
			success: "text-foreground",
			failure: "text-foreground",
		},
	},
});

type StepListItemProps = Step;
const StepListItem: FC<StepListItemProps> = ({ title, ...step }) => (
	<div
		className={cn(
			stepListItemVariant({
				status: step.status,
			}),
		)}
	>
		<p>{title}</p>
		<div className="flex items-center justify-end gap-2">
			{match(step)
				.with({ status: "idle" }, () => <></>)
				.otherwise((otherStep) => (
					<span className="text-xs">{otherStep.time}</span>
				))}
			{match(step)
				.with({ status: "idle" }, () => <CircleIcon className="w-4 h-4" />)
				.with({ status: "running" }, () => (
					<LoaderCircleIcon className="w-4 h-4 animate-spin" />
				))
				.with({ status: "success" }, () => (
					<CircleCheckIcon className="w-4 h-4" />
				))
				// .with({ status: "failure" }, () => <CircleIcon className="w-4 h-4" />)
				.exhaustive()}
		</div>
	</div>
);

type WorkflowRunnerProps = {
	run: Run;
};
export const WorkflowRunner: FC<WorkflowRunnerProps> = ({ run }) => {
	return (
		<div className="bg-background/50 border border-border w-[200px] text-sm">
			<div className="px-4 py-1 border-b">
				<p>Run Workflow</p>
			</div>
			<div className="px-4 py-2 flex flex-col gap-2">
				{run.steps.map((runner) => (
					<StepListItem key={runner.id} {...runner} />
				))}
			</div>
		</div>
	);
};
