import { db } from "@/drizzle/db";
import {
	nodes as nodesSchema,
	runProcesses as runStepsSchema,
	runs,
	processes as stepsSchema,
	workflows,
} from "@/drizzle/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import type { StepWithNodeAndRunStep } from "../types";

export const GET = async (
	req: Request,
	{ params }: { params: { urlId: string; workflowId: string } },
) => {
	const workflow = await db.query.workflows.findFirst({
		where: eq(workflows.id, Number.parseInt(params.workflowId)),
	});
	invariant(workflow != null, "Not found");
	const nodes = await db.query.nodes.findMany({
		where: eq(nodesSchema.blueprintId, workflow.workspaceId),
	});
	const steps = await db.query.steps.findMany({
		where: eq(stepsSchema.workflowId, workflow.id),
		orderBy: [asc(stepsSchema.order)],
	});
	const latestRun = await db.query.runs.findFirst({
		where: eq(runs.workflowId, workflow.id),
		orderBy: [desc(runs.createdAt)],
	});
	invariant(latestRun != null, "Not found");
	const latestRunSteps = await db.query.runSteps.findMany({
		where: eq(runStepsSchema.runId, latestRun.id),
	});
	const stepsWithNodes: StepWithNodeAndRunStep[] = steps.map((step) => {
		const node = nodes.find((n) => n.id === step.nodeId);
		const latestRunStep = latestRunSteps.find(
			(runStep) => runStep.stepId === step.id,
		);
		invariant(node != null, "Not found node");
		invariant(latestRunStep != null, "Not found latestRunStep");
		return {
			...step,
			node,
			runStep: latestRunStep,
		};
	});
	return NextResponse.json({
		...workflow,
		steps: stepsWithNodes,
		latestRun,
		latestRunSteps,
	});
};
