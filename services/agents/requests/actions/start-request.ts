"use server";

import { type RequestId, requestStatus } from "../types";
import { revalidateGetRequest } from "./get-request";
import { updateRequestStatus } from "./run";

export const startRequest = async (requestId: RequestId) => {
	await updateRequestStatus(requestId, requestStatus.inProgress);
	await revalidateGetRequest(requestId);
};
