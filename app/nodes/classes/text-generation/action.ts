"use server";

import { leaveMessage } from "@/app/agents/requests";
import { db, pullMessages } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import OpenAI from "openai";
import invariant from "tiny-invariant";
import type { Action } from "../../type";

const openai = new OpenAI();

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = () => {};

export const action: Action = async ({ requestId, nodeId, blueprint }) => {
	const blueprintNode = blueprint.nodes.find(({ id }) => id === nodeId);
	invariant(blueprintNode != null, `node not found: ${nodeId}`);
	const instructionPort = blueprintNode.inputPorts.find(
		({ name }) => name === "instruction",
	);
	invariant(instructionPort != null, `instruction port not found: ${nodeId}`);
	const resultPort = blueprintNode.outputPorts.find(
		({ name }) => name === "result",
	);
	invariant(resultPort != null, `result port not found: ${nodeId}`);

	const [instructionMessage] = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, requestId),
				eq(pullMessages.nodeId, nodeId),
				eq(pullMessages.portId, instructionPort.id),
			),
		);
	const content = instructionMessage.content;
	asssertContent(content);
	const completion = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content },
		],
		model: "gpt-4o-mini",
	});
	await leaveMessage({
		requestId,
		portId: resultPort.id,
		message: completion.choices[0].message.content ?? "",
	});
};
