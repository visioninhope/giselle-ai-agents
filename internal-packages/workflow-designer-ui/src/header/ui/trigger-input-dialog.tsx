import type {
	Generation,
	ParameterItem,
	TriggerNode,
} from "@giselle-sdk/data-type";
import type { githubTriggers } from "@giselle-sdk/flow";
import { useGenerationRunnerSystem } from "@giselle-sdk/giselle-engine/react";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
import { clsx } from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { LoaderIcon, PlayIcon, XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import {
	type ButtonHTMLAttributes,
	type FormEventHandler,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";
import type { z } from "zod";
import { useTrigger } from "../../hooks/use-trigger";

export function Button({
	leftIcon: LeftIcon,
	rightIcon: RightIcon,
	loading = false,
	children,
	...props
}: {
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			className={clsx(
				"bg-white-900 px-[8px] rounded-[4px] py-[4px] text-[14px] flex items-center gap-[4px] outline-none text-black-900",
				"data-[loading=true]:cursor-not-allowed data-[loading=true]:opacity-60",
				"data-[loading=false]:cursor-pointer",
			)}
			data-loading={loading}
			disabled={loading}
			{...props}
		>
			{loading ? <LoaderIcon className="size-[14px] animate-spin" /> : LeftIcon}
			<div>{children}</div>
			{!loading && RightIcon}
		</button>
	);
}

export function buttonLabel(node: TriggerNode) {
	switch (node.content.provider) {
		case "manual":
			return "Start Manual Flow";
		case "github":
			return "Test with dummy data";
		default: {
			const _exhaustiveCheck: never = node.content.provider;
			throw new Error(`Unhandled trigger provider type: ${_exhaustiveCheck}`);
		}
	}
}

interface Input {
	name: string;
	label: string;
	type: "text" | "multiline-text" | "number";
	required: boolean;
}

type GithubEventInputMap = {
	[K in keyof typeof githubTriggers]: {
		[K2 in keyof z.infer<
			(typeof githubTriggers)[K]["event"]["payloads"]
		>]: Omit<Input, "name">;
	};
};

// Define the input fields for each GitHub event type
const githubEventInputs: GithubEventInputMap = {
	"github.issue.created": {
		issueNumber: {
			label: "Issue Number",
			type: "number",
			required: true,
		},
		title: {
			label: "Title",
			type: "text",
			required: true,
		},
		body: {
			label: "Body",
			type: "multiline-text",
			required: false,
		},
	},
	"github.issue.closed": {
		issueNumber: {
			label: "Issue Number",
			type: "number",
			required: true,
		},
		title: {
			label: "Title",
			type: "text",
			required: true,
		},
		body: {
			label: "Body",
			type: "multiline-text",
			required: false,
		},
	},
	"github.issue_comment.created": {
		issueNumber: {
			label: "Issue Number",
			type: "number",
			required: true,
		},
		issueTitle: {
			label: "Issue Title",
			type: "text",
			required: true,
		},
		issueBody: {
			label: "Issue Body",
			type: "multiline-text",
			required: true,
		},
		body: {
			label: "Issue Comment",
			type: "multiline-text",
			required: true,
		},
	},
	"github.pull_request_comment.created": {
		issueNumber: {
			label: "Pull Request Number",
			type: "number",
			required: true,
		},
		issueTitle: {
			label: "Pull Request Title",
			type: "text",
			required: true,
		},
		issueBody: {
			label: "Pull Request Body",
			type: "multiline-text",
			required: true,
		},
		body: {
			label: "Pull Request Comment",
			type: "multiline-text",
			required: true,
		},
	},
	"github.pull_request.ready_for_review": {
		title: {
			label: "Title",
			type: "text",
			required: true,
		},
		body: {
			label: "Body",
			type: "multiline-text",
			required: false,
		},
		number: {
			label: "Number",
			type: "number",
			required: true,
		},
		diff: {
			label: "diff",
			type: "multiline-text",
			required: false,
		},
		pullRequestUrl: {
			label: "Pull request URL",
			type: "text",
			required: true,
		},
	},
	"github.pull_request.closed": {
		title: {
			label: "Title",
			type: "text",
			required: true,
		},
		body: {
			label: "Body",
			type: "multiline-text",
			required: false,
		},
		number: {
			label: "Number",
			type: "number",
			required: true,
		},
		pullRequestUrl: {
			label: "Pull request URL",
			type: "text",
			required: true,
		},
	},
	"github.pull_request.opened": {
		title: {
			label: "Title",
			type: "text",
			required: true,
		},
		body: {
			label: "Body",
			type: "multiline-text",
			required: false,
		},
		number: {
			label: "Number",
			type: "number",
			required: true,
		},
		diff: {
			label: "diff",
			type: "multiline-text",
			required: false,
		},
		pullRequestUrl: {
			label: "Pull request URL",
			type: "text",
			required: true,
		},
	},
};

export function TriggerInputDialog({
	node,
}: {
	node: TriggerNode;
}) {
	const { data: trigger, isLoading } = useTrigger(node);
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { createGeneration, startGeneration } = useGenerationRunnerSystem();
	const { data } = useWorkflowDesigner();

	const inputs = useMemo<Input[]>(() => {
		if (trigger === undefined) {
			return [];
		}

		switch (trigger.configuration.provider) {
			case "github": {
				const inputDefs = githubEventInputs[trigger.configuration.event.id];
				return Object.entries(inputDefs).map(([name, def]) => ({
					name,
					label: def.label,
					type: def.type,
					required: def.required,
				}));
			}
			case "manual": {
				return trigger.configuration.event.parameters.map((parameter) => ({
					name: parameter.id,
					label: parameter.name,
					type: parameter.type,
					required: parameter.required,
				}));
			}
			default: {
				const _exhaustiveCheck: never = trigger.configuration;
				throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
			}
		}
	}, [trigger]);

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault();

			const formData = new FormData(e.currentTarget);

			const errors: Record<string, string> = {};
			const validatedValues: Record<string, string | number> = {};

			for (const input of inputs) {
				const formDataEntryValue = formData.get(input.name);
				const value = formDataEntryValue
					? formDataEntryValue.toString().trim()
					: "";

				if (input.required && value === "") {
					errors[input.name] = `${input.label} is required`;
					continue;
				}

				if (value === "") {
					validatedValues[input.name] = "";
					continue;
				}

				switch (input.type) {
					case "text":
					case "multiline-text":
						validatedValues[input.name] = value;
						break;
					case "number": {
						const numValue = Number(value);
						if (Number.isNaN(numValue)) {
							errors[input.name] = `${input.label} must be a valid number`;
						} else {
							validatedValues[input.name] = numValue;
						}
						break;
					}
					default: {
						const _exhaustiveCheck: never = input.type;
						throw new Error(`Unhandled input type: ${_exhaustiveCheck}`);
					}
				}
			}

			if (Object.keys(errors).length > 0) {
				setValidationErrors(errors);
				return;
			}

			setValidationErrors({});
			setIsSubmitting(true);

			try {
				const flow = buildWorkflowFromNode(
					node.id,
					data.nodes,
					data.connections,
				);
				if (flow === null) {
					return;
				}
				const generations: Generation[] = [];
				flow.jobs.map((job) =>
					job.operations.map((operation) => {
						const parameterItems: ParameterItem[] = [];
						if (operation.node.content.type === "trigger") {
							for (const input of inputs) {
								const validatedValue = validatedValues[input.name];
								if (validatedValue !== undefined && validatedValue !== "") {
									switch (input.type) {
										case "text":
										case "multiline-text":
											parameterItems.push({
												type: "string",
												name: input.name,
												value: validatedValue as string,
											});
											break;
										case "number":
											parameterItems.push({
												type: "number",
												name: input.name,
												value: validatedValue as number,
											});
											break;
										default: {
											const _exhaustiveCheck: never = input.type;
											throw new Error(
												`Unhandled input type: ${_exhaustiveCheck}`,
											);
										}
									}
								}
							}
						}
						generations.push(
							createGeneration({
								origin: {
									type: "workspace",
									id: data.id,
								},
								inputs:
									parameterItems.length > 0
										? [{ type: "parameters", items: parameterItems }]
										: [],
								...operation.generationTemplate,
							}),
						);
					}),
				);
				for (const job of flow.jobs) {
					await Promise.all(
						job.operations.map(async (operation) => {
							const generation = generations.find(
								(generation) =>
									generation.context.operationNode.id ===
									operation.generationTemplate.operationNode.id,
							);
							if (generation === undefined) {
								return;
							}
							await startGeneration(generation.id);
						}),
					);
				}
			} finally {
				setIsSubmitting(false);
			}
		},
		[node.id, data, createGeneration, startGeneration, inputs],
	);

	if (isLoading || trigger === undefined) {
		return null;
	}
	return (
		<>
			<div className="flex justify-between items-center mb-[24px]">
				<h2 className="font-accent text-[18px] font-bold text-primary-100 drop-shadow-[0_0_10px_#0087F6]">
					{buttonLabel(node)}
				</h2>
				<div className="flex gap-[12px]">
					<Dialog.Close asChild>
						<button
							type="button"
							className="text-white-400 hover:text-white-900 outline-none"
						>
							<XIcon className="size-[20px]" />
						</button>
					</Dialog.Close>
				</div>
			</div>
			<div className="flex flex-col h-full">
				<form
					className="flex-1 flex flex-col gap-[24px] relative text-white-800 overflow-y-hidden"
					onSubmit={handleSubmit}
				>
					<p className="text-[12px] mb-[8px] text-black-400 font-hubot font-semibold">
						Execute this flow with custom input values
					</p>
					<div className="flex flex-col gap-[8px]">
						{inputs.map((input) => {
							return (
								<fieldset key={input.name} className={clsx("grid gap-2")}>
									<label
										className="text-[14px] font-medium text-white-900"
										htmlFor={input.name}
									>
										{input.label}
										{input.required && (
											<span className="text-red-500 ml-1">*</span>
										)}
									</label>
									{input.type === "text" && (
										<input
											type="text"
											name={input.name}
											id={input.name}
											className={clsx(
												"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
												"border-[1px]",
												validationErrors[input.name]
													? "border-red-500"
													: "border-white-900",
												"text-[14px]",
											)}
										/>
									)}
									{input.type === "multiline-text" && (
										<textarea
											name={input.name}
											id={input.name}
											className={clsx(
												"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
												"border-[1px]",
												validationErrors[input.name]
													? "border-red-500"
													: "border-white-900",
												"text-[14px]",
											)}
											rows={4}
										/>
									)}
									{input.type === "number" && (
										<input
											type="number"
											name={input.name}
											id={input.name}
											className={clsx(
												"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
												"border-[1px]",
												validationErrors[input.name]
													? "border-red-500"
													: "border-white-900",
												"text-[14px]",
											)}
										/>
									)}
									{validationErrors[input.name] && (
										<span className="text-red-500 text-[12px] font-medium">
											{validationErrors[input.name]}
										</span>
									)}
								</fieldset>
							);
						})}
					</div>
					<div className="flex justify-end">
						<Button
							type="submit"
							loading={isSubmitting}
							leftIcon={<PlayIcon className="size-[14px] fill-black-900" />}
						>
							{isSubmitting ? "Running..." : "Run with params"}
						</Button>
					</div>
				</form>
			</div>
		</>
	);
}
