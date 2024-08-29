"use server";

import { db, pullMessages, requestPortMessages } from "@/drizzle";
import { openai } from "@/lib/openai";
import { insertRequestPortMessage } from "@/services/agents/requests/insert-request-port-message";
import { and, eq } from "drizzle-orm";
import type { Port } from "../../type";

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = () => {};

type ActionArgs = {
	requestDbId: number;
	nodeDbId: number;
	instructionPort: Port;
	resultPort: Port;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const generateText = async ({
	requestDbId,
	nodeDbId,
	instructionPort,
	resultPort,
}: ActionArgs) => {
	const [instructionMessage] = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestDbId, requestDbId),
				eq(pullMessages.nodeDbId, nodeDbId),
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
	await insertRequestPortMessage({
		requestDbId,
		portId: resultPort.id,
		message: completion.choices[0].message.content ?? "",
	});
};
