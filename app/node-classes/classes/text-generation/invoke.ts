"use server";

import { logger } from "@trigger.dev/sdk/v3";
import type { InvokeFunction } from "../../type";

export const invoke: InvokeFunction = async ({ run, id }) => {
	logger.log("text generation started...");
};
