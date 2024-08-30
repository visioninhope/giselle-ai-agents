import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircleIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";
import type { FC } from "react";
import { match } from "ts-pattern";
import { useRequest } from "../contexts/request-provider";
import { requestStepStatus } from "../types";

export const RequestLogger: FC = () => {
	const { lastRequest } = useRequest();

	if (lastRequest == null) {
		return;
	}
	return (
		<div>
			<h1>Request Logger</h1>
			<Accordion type="multiple">
				{lastRequest.stacks.flatMap((stack) =>
					stack.steps.map((step) => (
						<AccordionItem key={step.id} value={step.id}>
							<AccordionTrigger>
								<div className="flex items-center justify-between w-full">
									<p>{step.id}</p>
									<div className="flex items-center justify-end gap-2">
										{match(step)
											.with({ status: requestStepStatus.queued }, () => (
												<CircleIcon className="w-4 h-4" />
											))
											.with({ status: requestStepStatus.inProgress }, () => (
												<LoaderCircleIcon className="w-4 h-4 animate-spin" />
											))
											.with({ status: requestStepStatus.completed }, () => (
												<CheckCircleIcon className="w-4 h-4" />
											))
											.otherwise(() => null)}
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent>hello</AccordionContent>
						</AccordionItem>
					)),
				)}
			</Accordion>
		</div>
	);
};
