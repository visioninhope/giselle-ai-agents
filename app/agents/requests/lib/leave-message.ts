"use server";

import { db, requestPortMessages } from "@/drizzle";

type LeaveMessageArgs = {
	requestId: number;
	portId: number;
	message: string;
};
export const leaveMessage = async ({
	requestId,
	portId,
	message,
}: LeaveMessageArgs) => {
	await db.insert(requestPortMessages).values({
		portId,
		requestId,
		message,
	});
};
