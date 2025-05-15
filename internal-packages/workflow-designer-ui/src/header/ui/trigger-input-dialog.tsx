import type { FlowTrigger, TriggerNode } from "@giselle-sdk/data-type";
import { githubTriggers } from "@giselle-sdk/flow";
import { clsx } from "clsx/lite";
import { useMemo } from "react";
import type { ZodSchema } from "zod";
import { Button } from "../../ui/button";

interface Input {
	name: string;
	label: string;
	type: "string" | "number" | "text";
	required: boolean;
}

export function TriggerInputDialog({
	node,
	trigger,
}: {
	node: TriggerNode;
	trigger: FlowTrigger;
}) {
	const inputs = useMemo<Input[]>(() => {
		switch (trigger.configuration.provider) {
			case "github": {
				const githubTrigger = githubTriggers.find(
					(githubTrigger) =>
						githubTrigger.event.id === trigger.configuration.event.id,
				);
				if (githubTrigger === undefined) {
					return [];
				}
				switch (githubTrigger.event.id) {
					case "github.issue.created":
						return [
							{
								name: "title",
								label: "Title",
								type: "string",
								required: true,
							},
							{
								name: "body",
								label: "Body",
								type: "text",
								required: false,
							},
						];
					case "github.issue_comment.created":
						githubTrigger.event.payloads;
						return [
							{
								name: "issueId",
								label: "Issue ID",
								type: "number",
								required: true,
							},
							{
								name: "issueTitle",
								label: "Issue Title",
								type: "string",
								required: true,
							},
							{
								name: "issueBody",
								label: "Issue Body",
								type: "text",
								required: true,
							},
							{
								name: "issueCommentBody",
								label: "Issue Comment",
								type: "text",
								required: true,
							},
						];
					default: {
						const _exhaustiveCheck: never = githubTrigger.event;
						throw new Error(`Unhandled event id: ${_exhaustiveCheck}`);
					}
				}
			}
			case "manual": {
				if (!trigger.configuration.event.parameters) {
					return [];
				}

				return [];
			}
			default: {
				const _exhaustiveCheck: never = trigger.configuration;
				throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
			}
		}
	}, [trigger]);
	return (
		<div className="flex flex-col h-full">
			<form className="flex-1 flex flex-col gap-[24px] relative text-white-800 overflow-y-hidden">
				<p className="text-[12px] mb-[8px] text-black-400 font-hubot font-semibold">
					Execute this flow with custom input values
				</p>
				<div className="flex flex-col gap-[8px]">
					{inputs.map((input) => {
						return (
							<fieldset
								key={input.name}
								className={clsx("grid gap-2")}
								// onClick={() => handleNodeSelect(output.id)}
								// aria-pressed={activeNodeId === output.id}
							>
								<label
									className="text-[14px] font-medium text-white-900"
									htmlFor={input.name}
								>
									{input.label}
								</label>
								{input.type === "string" && (
									<input
										type="text"
										name={input.name}
										id={input.name}
										className={clsx(
											"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
											"border-[1px] border-white-900",
											"text-[14px]",
										)}
									/>
								)}
								{input.type === "text" && (
									<textarea
										name={input.name}
										id={input.name}
										className={clsx(
											"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
											"border-[1px] border-white-900",
											"text-[14px]",
										)}
										rows={4}
									/>
								)}
							</fieldset>
						);
					})}
				</div>
				<div className="flex justify-end">
					<Button type="submit">Run with params</Button>
				</div>
			</form>
		</div>
	);
}
