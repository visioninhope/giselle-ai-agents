import { cn } from "@/lib/utils";
import { cva } from "cva";
import { CircleCheckIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";
import type { FC } from "react";
import { match } from "ts-pattern";

import type { StepWithNodeAndRunStep } from "@/app/api/workspaces/[slug]/workflows/types";
import type { RunStatus } from "@/drizzle/schema";
const stepListItemVariant = cva({
	base: "flex items-center justify-between ",
	variants: {
		status: {
			idle: "text-muted-foreground",
			running: "text-foreground",
			success: "text-foreground",
			failed: "text-foreground",
		},
	},
});

type StepListItemProps = StepWithNodeAndRunStep;
const StepListItem: FC<StepListItemProps> = (props) => (
	<div
		className={cn(
			stepListItemVariant({
				status: props.runStep.status,
			}),
		)}
	>
		<p>{props.node.type}</p>
		<div className="flex items-center justify-end gap-2">
			{match(props.runStep)
				.with({ status: "idle" }, () => <></>)
				.otherwise(() => (
					<span className="text-xs">2s</span>
				))}
			{match(props.runStep)
				.with({ status: "idle" }, () => <CircleIcon className="w-4 h-4" />)
				.with({ status: "running" }, () => (
					<LoaderCircleIcon className="w-4 h-4 animate-spin" />
				))
				.with({ status: "success" }, () => (
					<CircleCheckIcon className="w-4 h-4" />
				))
				// .with({ status: "failure" }, () => <CircleIcon className="w-4 h-4" />)
				.otherwise(() => null)}
		</div>
	</div>
);

type WorkflowRunnerProps = {
	status: RunStatus;
	steps: StepWithNodeAndRunStep[];
};
export const WorkflowRunner: FC<WorkflowRunnerProps> = ({ steps, status }) => {
	return (
		<div className="bg-background/50 border border-border w-[200px] text-sm">
			<div className="px-4 py-1 border-b">
				<p>Run Workflow</p>
			</div>

			<div className="px-4 py-2 flex flex-col gap-2">
				{match(status)
					.with("creating", () => <p>Creating workflow...</p>)
					.otherwise(() =>
						steps.map((step) => <StepListItem key={step.id} {...step} />),
					)}
			</div>
		</div>
	);
};
