import {
	db,
	requestSteps as requestStepSchema,
	requests as requestsSchema,
	requestTriggerRelations as runTriggerRelationsSchema,
	steps as stepsSchema,
} from "@/drizzle";
import { invokeTask } from "@/trigger/invoke";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type Payload = {
	blueprintId: number;
};
type AssertPayload = (value: unknown) => asserts value is Payload;
/** @todo */
const assertPayload: AssertPayload = () => {};
export const POST = async (req: Request) => {
	const json = await req.json();
	assertPayload(json);
	const [request] = await db
		.insert(requestsSchema)
		.values({
			blueprintId: json.blueprintId,
			status: "creating",
		})
		.returning({ id: requestsSchema.id });
	const steps = await db.query.steps.findMany({
		where: eq(stepsSchema.blueprintId, json.blueprintId),
		orderBy: asc(stepsSchema.order),
	});
	await db.insert(requestStepSchema).values(
		steps.map<typeof requestStepSchema.$inferInsert>(({ id }) => ({
			requestId: request.id,
			stepId: id,
			status: "idle",
		})),
	);
	const handle = await invokeTask.trigger({
		requestId: request.id,
	});

	await db.insert(runTriggerRelationsSchema).values({
		requestId: request.id,
		triggerId: handle.id,
	});

	return NextResponse.json({
		id: request.id,
	});
};
