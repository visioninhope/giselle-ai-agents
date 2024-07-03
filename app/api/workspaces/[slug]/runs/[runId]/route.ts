import { db, findWorkspaceBySlug } from "@/drizzle/db";
import { runs, workspaces } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export type ResponseJson = {
	run: typeof runs.$inferSelect;
};
export const GET = async (
	req: Request,
	{ params }: { params: { slug: string; runId: string } },
) => {
	const run = await db.query.runs.findFirst({
		where: eq(runs.id, Number.parseInt(params.runId)),
	});
	return Response.json({ run });
};
