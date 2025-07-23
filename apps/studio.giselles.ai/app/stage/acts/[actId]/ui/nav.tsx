"use client";

import type { Act, Generation, Sequence, Step } from "@giselle-sdk/giselle";
import { defaultName } from "@giselle-sdk/giselle/react";
import {
	CheckIcon,
	ChevronDownIcon,
	CircleDashedIcon,
	CircleSlashIcon,
	RefreshCw,
	XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accordion } from "radix-ui";

interface StepWithGeneration extends Step {
	generation: Generation;
}
interface SequenceWithGeneration extends Sequence {
	steps: StepWithGeneration[];
}
interface ActWithGeneration extends Act {
	sequences: SequenceWithGeneration[];
}

interface NavProps {
	act: ActWithGeneration;
}

export function Nav({ act }: NavProps) {
	const pathname = usePathname();
	return (
		<Accordion.Root type="multiple" className="flex flex-col gap-[8px]">
			{act.sequences.map((sequence, index) => (
				<Accordion.Item key={sequence.id} value={sequence.id}>
					<Accordion.Header className="border border-border rounded-[8px] p-[8px] flex justify-between items-center">
						<div className="flex items-center gap-2">
							<div className="text-muted-foreground">
								{sequence.status === "success" && (
									<CheckIcon className="text-success size-[16px]" />
								)}
								{sequence.status === "in-progress" && (
									<RefreshCw className="text-info size-[16px] animate-spin" />
								)}
								{sequence.status === "failed" && (
									<XIcon className="text-error size-[16px]" />
								)}
								{sequence.status === "pending" && (
									<CircleDashedIcon className="text-text-muted size-[16px]" />
								)}
							</div>
							<span className="text-sm">Sequence {index + 1}</span>
						</div>
						<Accordion.Trigger className="group p-[2px] hover:bg-ghost-element-hover rounded-[4px] cursor-pointer outline-none data-[state=open]:bg-ghost-element-active">
							<ChevronDownIcon className="text-text-muted size-[14px] group-data-[state=open]:rotate-180 transition-transform" />
						</Accordion.Trigger>
					</Accordion.Header>

					<Accordion.Content className="pl-[2px] ml-[10px] border-l border-border overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
						<div className="py-[8px]">
							<div className="space-y-2 pl-[8px]">
								{sequence.steps.map((step) => (
									<Link
										href={`/stage/acts/${act.id}/${step.id}`}
										key={step.id}
										className="group flex items-center justify-between text-[11px] text-text-muted bg-transparent hover:bg-ghost-element-hover rounded-[4px] px-[4px] py-[2px] transition-colors data-[state=active]:bg-ghost-element-active"
										data-state={
											pathname === `/stage/acts/${act.id}/${step.id}`
												? "active"
												: ""
										}
									>
										<div className="flex items-center gap-[4px] ">
											{step.generation.status === "queued" && (
												<CircleDashedIcon className="text-text-muted size-[12px]" />
											)}
											{step.generation.status === "running" && (
												<RefreshCw className="text-info size-[12px] animate-spin" />
											)}
											{step.generation.status === "completed" && (
												<CheckIcon className="text-success size-[12px]" />
											)}
											{step.generation.status === "failed" && (
												<XIcon className="text-error size-[12px]" />
											)}
											{step.generation.status === "cancelled" && (
												<CircleSlashIcon className="text-text-muted size-[12px]" />
											)}
											<span>
												{step.generation.context.operationNode.name ??
													defaultName(step.generation.context.operationNode)}
											</span>
										</div>
										<span className="opacity-0 group-hover:opacity-100 group-data-[state=active]:hidden transition-opacity">
											Show
										</span>
									</Link>
								))}
							</div>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			))}
		</Accordion.Root>
	);
}
