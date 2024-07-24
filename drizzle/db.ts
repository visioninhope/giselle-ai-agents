import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";
import { requestSteps, requests } from "./schema";

export const db = drizzle(sql, { schema });

export const updateRun = async (
	runId: number,
	updateValues: Pick<
		typeof requests.$inferInsert,
		"status" | "startedAt" | "finishedAt"
	>,
) => {
	await db.update(requests).set(updateValues).where(eq(requests.id, runId));
};
export const updateRunStep = async (
	runId: number,
	stepId: number,
	updateValues: Pick<
		typeof requestSteps.$inferInsert,
		"status" | "startedAt" | "finishedAt"
	>,
) => {
	await db
		.update(requestSteps)
		.set(updateValues)
		.where(
			and(eq(requestSteps.requestId, runId), eq(requestSteps.stepId, stepId)),
		);
};
