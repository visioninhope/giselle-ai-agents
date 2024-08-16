"use server";

import { leaveMessage } from "@/app/agents/requests";
import { db, pullMessages } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI();

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = () => {};

type ActionArgs = {
	requestId: number;
	nodeId: number;
	instructionPortId: number;
	resultPortId: number;
};

export const generateText = async ({
	requestId,
	nodeId,
	instructionPortId,
	resultPortId,
}: ActionArgs) => {
	const [instructionMessage] = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, requestId),
				eq(pullMessages.nodeId, nodeId),
				eq(pullMessages.portId, instructionPortId),
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
		portId: resultPortId,
		message: completion.choices[0].message.content ?? "",
	});
};
