import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import { and, asc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";
import {
	dataKnots,
	dataRoutes,
	nodes,
	ports,
	requestDataKnotMessages,
	requestSteps,
	requests,
	steps,
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
	const runDataKnotMessage = await db.query.requestDataKnotMessages.findFirst({
		where: and(
			eq(requestDataKnotMessages.dataKnotId, dataKnotId),
			eq(requestDataKnotMessages.requestId, runId),
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
	requestId: number,
	stepId: number,
	messages: Message[],
) => {
	const stepDataKnots = await db
		.select({
			portName: ports.name,
			direction: ports.direction,
			dataKnotId: dataKnots.id,
		})
		.from(steps)
		.innerJoin(nodes, eq(nodes.id, steps.nodeId))
		.innerJoin(ports, eq(ports.nodeId, nodes.id))
		.innerJoin(
			dataKnots,
			and(eq(dataKnots.portId, ports.id), eq(dataKnots.stepId, steps.id)),
		)
		.where(eq(steps.id, stepId));

	for (const message of messages) {
		const stepDataKnot = stepDataKnots.find(
			(stepDataKnot) => stepDataKnot.portName === message.portName,
		);
		if (stepDataKnot == null) {
			continue;
		}
		await db.insert(requestDataKnotMessages).values({
			requestId,
			dataKnotId: stepDataKnot.dataKnotId,
			message: message.value,
		});
	}
	// const stepDataKnots = await db
	// 	.select()
	// 	.from(stepDataKnotsSchema)
	// 	.where(eq(stepDataKnotsSchema.stepId, stepId));
	// for (const message of messages) {
	// 	const stepDataKnot = stepDataKnots.find(
	// 		(stepDataKnot) => stepDataKnot.portName === message.portName,
	// 	);
	// 	if (stepDataKnot == null) {
	// 		continue;
	// 	}
	// 	await db.insert(runDataKnotMessages).values({
	// 		runId,
	// 		dataKnotId: stepDataKnot.dataKnotId,
	// 		message: message.value,
	// 	});
	// }
};

// SELECT
//   steps.id AS step_id,
//   steps.node_id AS node_id,
//   ports.name AS port_name,
//   run_data_knot_messages.run_id AS run_id,
//   run_data_knot_messages.message AS message
// FROM
//   steps
//   INNER JOIN nodes ON nodes.id = steps.node_id
//   INNER JOIN ports ON ports.node_id = nodes.id
//   INNER JOIN data_knots ON data_knots.port_id = ports.id
//   AND data_knots.step_id = steps.id
//   INNER JOIN data_routes ON data_routes.destination_knot_id = data_knots.id
//   INNER JOIN data_knots origin_data_knots ON origin_data_knots.id = data_routes.origin_knot_id
//   INNER JOIN run_data_knot_messages ON run_data_knot_messages.data_knot_id = origin_data_knots.id
export const pullMessages = async (runId: number, stepId: number) => {
	const originDataKnots = alias(dataKnots, "originDataKnots");
	const stepStrands = await db
		.select({
			message: requestDataKnotMessages.message,
			portName: ports.name,
		})
		.from(steps)
		.innerJoin(nodes, eq(nodes.id, steps.nodeId))
		.innerJoin(ports, eq(ports.nodeId, nodes.id))
		.innerJoin(
			dataKnots,
			and(eq(dataKnots.portId, ports.id), eq(dataKnots.stepId, steps.id)),
		)
		.innerJoin(dataRoutes, eq(dataRoutes.destinationKnotId, dataKnots.id))
		.innerJoin(originDataKnots, eq(originDataKnots.id, dataRoutes.originKnotId))
		.innerJoin(
			requestDataKnotMessages,
			and(
				eq(requestDataKnotMessages.dataKnotId, originDataKnots.id),
				eq(requestDataKnotMessages.requestId, runId),
			),
		);
	return stepStrands;
	// return await db
	// 	.select()
	// 	.from(stepStrandsSchema)
	// 	.where(
	// 		and(
	// 			eq(stepStrandsSchema.stepId, stepId),
	// 			eq(stepStrandsSchema.runId, runId),
	// 		),
	// 	);
};
