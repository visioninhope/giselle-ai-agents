import { db, findWorkspaceBySlug } from "@/drizzle/db";
import { runs, workspaces } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export type ResponseJson = {
	run: typeof runs.$inferSelect;
};
export const POST = async (
	req: Request,
	{ params }: { params: { slug: string; runId: string } },
) => {
	const workflow = await findWorkspaceBySlug(params.slug);
	invariant(workflow != null, "Workflow not found");
	const results = await db
		.insert(runs)
		.values({
			workflowId: workflow.id,
			status: "running",
		})
		.returning({
			insertedId: runs.id,
		});
	const run = await db.query.runs.findFirst({
		where: eq(runs.id, results[0].insertedId),
	});
	return Response.json({ run });
};

// export const POST = async (
// 	req: Request,
// 	{ params }: { params: { slug: string } },
// ) => {
// 	const workflow = await findWorkflowBySlug(params.slug);
// 	await runWorkflow(workflow);
// 	return Response.json({ workflow });
// };
