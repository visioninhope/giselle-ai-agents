import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircleIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";
import type { FC } from "react";
import { match } from "ts-pattern";
import { portDirection } from "../../nodes";
import { portType } from "../../nodes/types";
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
									<p>{step.node.name}</p>
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
							<AccordionContent>
								{match(step)
									.with({ status: requestStepStatus.inProgress }, () => (
										<p>Running...</p>
									))
									.with({ status: requestStepStatus.completed }, () => (
										<div className="max-h-[400px] overflow-y-auto flex flex-col gap-4">
											{step.node.ports.filter(
												({ direction, type }) =>
													type === portType.data &&
													direction === portDirection.target,
											).length > 0 && (
												<div>
													<p className="mb-2">Incoming Messages</p>
													{step.node.ports
														.filter(
															({ direction, type }) =>
																type === portType.data &&
																direction === portDirection.target,
														)
														.map((port) => (
															<p key={port.id} className="text-xs">
																{port.name}:
																{
																	step.portMessages.find(
																		({ portId }) => portId === port.id,
																	)?.message
																}
															</p>
														))}
												</div>
											)}
											{step.node.ports.filter(
												({ direction, type }) =>
													type === portType.data &&
													direction === portDirection.source,
											).length > 0 && (
												<div>
													<p className="mb-2">Outgoing Messages</p>
													{step.node.ports
														.filter(
															({ direction, type }) =>
																type === portType.data &&
																direction === portDirection.source,
														)
														.map((port) => (
															<p key={port.id} className="text-xs">
																{port.name}:
																{
																	step.portMessages.find(
																		({ portId }) => portId === port.id,
																	)?.message
																}
															</p>
														))}
												</div>
											)}
										</div>
									))
									.otherwise(() => null)}
							</AccordionContent>
						</AccordionItem>
					)),
				)}
			</Accordion>
		</div>
	);
};
