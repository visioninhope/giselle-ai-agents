import { cn } from "@/lib/utils";
import { cva } from "cva";
import { CircleCheckIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";
import type { FC } from "react";
import { match } from "ts-pattern";
import type { Step } from "./runner";

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
const StepListItem: FC<StepListItemProps> = ({ title, time, status }) => (
	<div
		className={cn(
			stepListItemVariant({
				status,
			}),
		)}
	>
		<p>{title}</p>
		<div className="flex items-center justify-end gap-2">
			{match(status)
				.with("idle", () => <></>)
				.otherwise(() => (
					<span className="text-xs">{time}</span>
				))}
			{match(status)
				.with("idle", () => <CircleIcon className="w-4 h-4" />)
				.with("running", () => (
					<LoaderCircleIcon className="w-4 h-4 animate-spin" />
				))
				.with("success", () => <CircleCheckIcon className="w-4 h-4" />)
				.with("failure", () => <CircleIcon className="w-4 h-4" />)
				.exhaustive()}
		</div>
	</div>
);

type WorkflowRunnerProps = {
	runId: string;
};
const run = {
	steps: [
		{
			id: "find-user",
			title: "Find User",
			time: "4s",
			status: "success",
		},
		{
			id: "send-mail",
			title: "Send Mail",
			time: "1s",
			status: "running",
		},
	],
} satisfies { steps: Step[] };
export const WorkflowRunner: FC<WorkflowRunnerProps> = () => {
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
