import {
	blueprints as blueprintsSchema,
	dataRoutes as dataRoutesSchema,
	dataKnots as dataknotsSchema,
	db,
	steps as stepsSchema,
} from "@/drizzle";
import type { InferResponse } from "@/lib/api";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getBlueprint } from "../get-blueprint";
import { inferSteps } from "./infer-step";

export const POST = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const blueprint = await getBlueprint(params.urlId);
	const inferedSteps = inferSteps(blueprint);
	const insertedProcesses = await db
		.insert(stepsSchema)
		.values(
			inferedSteps.map((process) => ({
				...process,
				blueprintId: blueprint.id,
			})),
		)
		.returning({
			insertedId: stepsSchema.id,
			nodeId: stepsSchema.nodeId,
		});
	const dataEdges = blueprint.edges.filter(
		({ edgeType }) => edgeType === "data",
	);
	for (const dataEdge of dataEdges) {
		const inputProcess = insertedProcesses.find(
			({ nodeId }) => nodeId === dataEdge.inputPort.nodeId,
		);
		const outputProcess = insertedProcesses.find(
			({ nodeId }) => nodeId === dataEdge.outputPort.nodeId,
		);
		const [inputDataKnot, outputDataKnot] = await db
			.insert(dataknotsSchema)
			.values([
				{ stepId: inputProcess?.insertedId, portId: dataEdge.inputPort.id },
				{ stepId: outputProcess?.insertedId, portId: dataEdge.inputPort.id },
			])
			.returning({
				insertedId: dataknotsSchema.id,
			});
		await db.insert(dataRoutesSchema).values({
			originKnotId: outputDataKnot.insertedId,
			destinationKnotId: inputDataKnot.insertedId,
		});
	}
	await db
		.update(blueprintsSchema)
		.set({ builded: true })
		.where(eq(blueprintsSchema.id, blueprint.id));
	return NextResponse.json({ blueprintId: blueprint.id });
};
