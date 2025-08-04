"use client";

import type { Act } from "@giselle-sdk/giselle";
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

interface NavProps {
	act: Act;
}

function SequenceBlock({ children }: React.PropsWithChildren) {
	return (
		<div className="border border-border rounded-[8px] p-[8px] flex justify-between items-center text-[14px]">
			{children}
		</div>
	);
}

export function Nav({ act }: NavProps) {
	const pathname = usePathname();
	return (
		<Accordion.Root type="multiple" className="flex flex-col gap-[8px]" defaultValue={act.sequences.map((sequence) =>sequence.id)}>
			{act.sequences.map((sequence, index) => (
				<Accordion.Item key={sequence.id} value={sequence.id}>
					<Accordion.Header asChild>
						<SequenceBlock>
							<div className="flex items-center gap-2">
								<div className="text-muted-foreground">
									{sequence.status === "completed" && (
										<CheckIcon className="text-success size-[16px]" />
									)}
									{sequence.status === "running" && (
										<RefreshCw className="text-info size-[16px] animate-spin" />
									)}
									{sequence.status === "failed" && (
										<XIcon className="text-error size-[16px]" />
									)}
									{sequence.status === "queued" && (
										<CircleDashedIcon className="text-text-muted size-[16px]" />
									)}
								</div>
								<span>Sequence {index + 1}</span>
							</div>
							<Accordion.Trigger className="group p-[2px] hover:bg-ghost-element-hover rounded-[4px] cursor-pointer outline-none data-[state=open]:bg-ghost-element-active">
								<ChevronDownIcon className="text-text-muted size-[14px] group-data-[state=open]:rotate-180 transition-transform" />
							</Accordion.Trigger>
						</SequenceBlock>
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
											{step.status === "queued" && (
												<CircleDashedIcon className="text-text-muted size-[12px]" />
											)}
											{step.status === "running" && (
												<RefreshCw className="text-info size-[12px] animate-spin" />
											)}
											{step.status === "completed" && (
												<CheckIcon className="text-success size-[12px]" />
											)}
											{step.status === "failed" && (
												<XIcon className="text-error size-[12px]" />
											)}
											{step.status === "cancelled" && (
												<CircleSlashIcon className="text-text-muted size-[12px]" />
											)}
											<span>{step.name}</span>
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
