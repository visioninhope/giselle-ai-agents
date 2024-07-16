import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import { and, asc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";
import {
	requestSteps,
	requests,
	runDataKnotMessages,
	stepDataKnots as stepDataKnotsSchema,
	stepStrands as stepStrandsSchema,
} from "./schema";

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

export const pullMessage = async (dataKnotId: number, runId: number) => {
	const runDataKnotMessage = await db.query.runDataKnotMessages.findFirst({
		where: and(
			eq(runDataKnotMessages.dataKnotId, dataKnotId),
			eq(runDataKnotMessages.runId, runId),
		),
	});
	const dataKnot = await db.query.dataKnots.findFirst({
		where: eq(schema.dataKnots.id, dataKnotId),
	});
};

type Message = {
	portName: string;
	// biome-ignore lint: lint/suspicious/noExplicitAny
	value: any;
};
export const leaveMessage = async (
	runId: number,
	stepId: number,
	messages: Message[],
) => {
	const stepDataKnots = await db
		.select()
		.from(stepDataKnotsSchema)
		.where(eq(stepDataKnotsSchema.stepId, stepId));
	for (const message of messages) {
		const stepDataKnot = stepDataKnots.find(
			(stepDataKnot) => stepDataKnot.portName === message.portName,
		);
		if (stepDataKnot == null) {
			continue;
		}
		await db.insert(runDataKnotMessages).values({
			runId,
			dataKnotId: stepDataKnot.dataKnotId,
			message: message.value,
		});
	}
};

export const pullMessages = async (runId: number, stepId: number) => {
	return await db
		.select()
		.from(stepStrandsSchema)
		.where(
			and(
				eq(stepStrandsSchema.stepId, stepId),
				eq(stepStrandsSchema.runId, runId),
			),
		);
};
