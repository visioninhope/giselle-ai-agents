import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { cva } from "cva";
import { CircleCheckIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";
import type { FC } from "react";
import { P, match } from "ts-pattern";

import type { AgentRequest, Step } from "@/app/agents/requests";
const stepListItemVariant = cva({
	base: "",
	variants: {
		status: {
			idle: "text-muted-foreground",
			running: "text-foreground",
			success: "text-foreground",
			failed: "text-foreground",
		},
	},
});

type StepListItemProps = Step;
const StepListItem: FC<StepListItemProps> = (props) => (
	<AccordionItem
		value={props.node.className}
		className={cn(
			stepListItemVariant({
				status: props.status,
			}),
		)}
	>
		<AccordionTrigger>
			<div className="flex items-center justify-between w-full">
				<p>{props.node.className}</p>
				<div className="flex items-center justify-end gap-2">
					{/* {match(props.runStep)
				.with({ status: "idle" }, () => <></>)
				.otherwise(() => (
					<span className="text-xs">2s</span>
				))} */}
					{match(props)
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
		</AccordionTrigger>
		<AccordionContent>
			<p>Hello</p>
		</AccordionContent>
	</AccordionItem>
);

type RequestLoggerProps = { request: AgentRequest };
export const RequestLogger: FC<RequestLoggerProps> = ({ request }) => {
	return (
		<div className="px-4 py-2 flex flex-col gap-2">
			<Accordion type="multiple">
				{match(request)
					.with(P.nullish, () => <p>Creating workflow...</p>)
					.otherwise(({ steps }) =>
						steps.map((step) => <StepListItem key={step.id} {...step} />),
					)}
			</Accordion>
		</div>
	);
};
