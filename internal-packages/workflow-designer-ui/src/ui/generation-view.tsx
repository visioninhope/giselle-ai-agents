import type {
	CompletedGeneration,
	Generation,
	NodeId,
	RunningGeneration,
} from "@giselle-sdk/data-type";
import { useMemo } from "react";
import { WilliIcon } from "../icons";
import { MemoizedMarkdown } from "./memoized-markdown";

function Spinner() {
	return (
		<div className="flex gap-[12px]">
			<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_infinite]" />
			<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_0.6s_infinite]" />
			<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_1.2s_infinite]" />
		</div>
	);
}
export function GenerationView({
	generation,
}: {
	generation: Generation;
}) {
	const generatedMessages = useMemo(
		() => generation.messages?.filter((m) => m.role === "assistant") ?? [],
		[generation],
	);
	if (generation.status === "failed") {
		return generation.error.message;
	}
	if (generation.status !== "running" && generation.status !== "completed") {
		return <Spinner />;
	}
	return (
		<div>
			{generatedMessages.map((message) => (
				<div key={message.id}>
					{message.parts?.map((part) => {
						switch (part.type) {
							case "reasoning":
								return <p key={part.reasoning}>{part.reasoning}</p>;

							case "text":
								return (
									<MemoizedMarkdown
										key={`${message.id}-text`}
										content={part.text}
									/>
								);
							case "tool-invocation":
								/** @todo Tool invocation */
								return (
									<ToolBlock
										key={part.toolInvocation.toolCallId}
										generation={generation}
										contextNodeId={part.toolInvocation.args.contextNodeId}
									/>
								);
							default: {
								const _exhaustiveCheck: never = part;
								throw new Error(`Unhandled part type: ${_exhaustiveCheck}`);
							}
						}
					})}
				</div>
			))}
			{generation.status !== "completed" && <Spinner />}
		</div>
	);
}

function ToolBlock({
	generation,
	contextNodeId,
}: {
	contextNodeId: NodeId;
	generation: RunningGeneration | CompletedGeneration;
}) {
	const contextNode = useMemo(
		() =>
			generation.context.sourceNodes.find(
				(sourceNode) => sourceNode.id === contextNodeId,
			),
		[generation, contextNodeId],
	);
	if (contextNode === undefined) {
		return null;
	}
	if (contextNode.content.type === "file") {
		return contextNode.content.files.map((file) => file.name).join(", ");
	}
	return null;
}
