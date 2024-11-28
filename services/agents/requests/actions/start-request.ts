"use server";

import { getUserTeamId, isRoute06User } from "@/app/(auth)/lib";
import { metrics } from "@opentelemetry/api";
import { type RequestId, requestStatus } from "../types";
import { revalidateGetRequest } from "./get-request";
import { updateRequestStatus } from "./run";

export const startRequest = async (requestId: RequestId) => {
	await updateRequestStatus(requestId, requestStatus.inProgress);
	await revalidateGetRequest(requestId);
	const meter = metrics.getMeter("agent");
	const requestCounter = meter.createCounter("agent_request", {
		description: "Number of Agent requests",
	});

	const teamId = await getUserTeamId();
	const isR06User = await isRoute06User();
	requestCounter.add(1, {
		teamId,
		isR06User,
	});
};
