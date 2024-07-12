import {
	db,
	requestStep as requestStepSchema,
	requests as requestsSchema,
	runTriggerRelations as runTriggerRelationsSchema,
	steps as stepsSchema,
} from "@/drizzle";
import { invokeTask } from "@/trigger/invoke";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import type { AgentRequest } from "./agent-request";

type Payload = {
	blueprintId: number;
};
type AssertPayload = (value: unknown) => asserts value is Payload;
/** @todo */
const assertPayload: AssertPayload = () => {};
export const POST = async (req: Request) => {
	const json = await req.json();
	assertPayload(json);
	const steps = await db.query.steps.findMany({
		where: eq(stepsSchema.blueprintId, json.blueprintId),
		orderBy: asc(stepsSchema.order),
	});
	const [request] = await db
		.insert(requestsSchema)
		.values({
			blueprintId: json.blueprintId,
			status: "creating",
		})
		.returning({ id: requestsSchema.id });
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
		runId: request.id,
		triggerId: handle.id,
	});

	const nodes = await db.query.nodes.findMany({
		columns: {
			id: true,
			type: true,
		},
		where: eq(stepsSchema.blueprintId, json.blueprintId),
	});
	const agentProcess: AgentRequest = {
		request: {
			id: request.id,
			blueprint: {
				id: json.blueprintId,
			},
			status: "creating",
			steps: steps.map(({ id, nodeId }) => {
				const node = nodes.find(({ id }) => id === nodeId);
				invariant(node != null, `Node not found: ${nodeId}`);
				return {
					id,
					node: {
						id: nodeId,
						type: node.type,
					},
					status: "idle",
					run: {
						id: request.id,
					},
				};
			}),
		},
	};
	return NextResponse.json(agentProcess);
};
