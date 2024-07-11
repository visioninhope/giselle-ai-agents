import { db, findWorkspaceBySlug } from "@/drizzle/db";
import { runs, workspaces } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export type ResponseJson = {
	run: typeof runs.$inferSelect;
};
export const POST = async (
	req: Request,
	{ params }: { params: { urlId: string; runId: string } },
) => {
	const workspace = await findWorkspaceBySlug(params.urlId);
	invariant(workspace != null, "Workflow not found");
	const results = await db
		.insert(runs)
		.values({
			workflowId: workspace.id,
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
