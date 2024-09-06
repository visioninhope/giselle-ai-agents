"use server";

import { db, pullMessages, requestPortMessages } from "@/drizzle";
import { openai } from "@/lib/openai";
import { and, eq } from "drizzle-orm";
import { insertRequestPortMessage } from "../../../requests/actions";
import type { RequestId } from "../../../requests/types";
import type { Port } from "../../types";

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = () => {};

type ActionArgs = {
	requestId: RequestId;
	requestDbId: number;
	nodeDbId: number;
	instructionPort: Port;
	resultPort: Port;
};

export const generateText = async ({
	requestId,
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
		requestId,
		requestDbId,
		portId: resultPort.id,
		message: completion.choices[0].message.content ?? "",
	});
};
