import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import invariant from "tiny-invariant";
import * as schema from "./schema";
import { runSteps, runs } from "./schema";

export const db = drizzle(sql, { schema });

export const getWorkflows = async () => {
	return db.query.workspaces.findMany();
};

export type WorkspaceWithNodeAndEdge = Awaited<
	ReturnType<typeof findWorkspaceBySlug>
>;
export const findWorkspaceBySlug = async (slug: string) => {
	const workflow = await db.query.workspaces.findFirst({
		where: eq(schema.workspaces.slug, slug),
	});
	invariant(workflow != null, "Workflow not found");
	const nodes = await db.query.nodes.findMany({
		where: eq(schema.nodes.workspaceId, workflow?.id),
	});
	const edges = await db.query.edges.findMany({
		where: eq(schema.edges.workspaceId, workflow?.id),
	});
	return {
		...workflow,
		nodes,
		edges,
	};
};

export const updateRun = async (
	runId: number,
	updateValues: Pick<
		typeof runs.$inferInsert,
		"status" | "startedAt" | "finishedAt"
	>,
) => {
	await db.update(runs).set(updateValues).where(eq(runs.id, runId));
};
export const updateRunStep = async (
	runId: number,
	stepId: number,
	updateValues: Pick<
		typeof runSteps.$inferInsert,
		"status" | "startedAt" | "finishedAt"
	>,
) => {
	await db
		.update(runSteps)
		.set(updateValues)
		.where(and(eq(runSteps.runId, runId), eq(runSteps.stepId, stepId)));
};
