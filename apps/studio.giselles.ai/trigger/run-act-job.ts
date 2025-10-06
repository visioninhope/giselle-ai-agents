import { ActId } from "@giselle-sdk/giselle";
import { logger, schemaTask as schemaJob } from "@trigger.dev/sdk";
import z from "zod/v4";
import { giselleEngine } from "@/app/giselle-engine";

export const runActJob = schemaJob({
	id: "run-act-job",
	schema: z.object({
		actId: ActId.schema,
	}),
	run: async (payload) => {
		await giselleEngine.runAct({
			actId: payload.actId,
			logger,
		});
	},
});
