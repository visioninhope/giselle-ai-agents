import { db } from "@/drizzle/db";
import {
	edges as edgesSchema,
	nodes as nodesSchema,
	workflows,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export type ResponseJson = {
	workflow: typeof workflows.$inferSelect & {
		nodes: (typeof nodesSchema.$inferSelect)[];
		edges: (typeof edgesSchema.$inferSelect)[];
	};
};
export const GET = async (
	req: Request,
	{ params }: { params: { slug: string } },
) => {
	const workflow = await db.query.workflows.findFirst({
		where: eq(workflows.slug, params.slug),
	});
	invariant(workflow != null, "Workflow not found");
	const nodes = await db.query.nodes.findMany({
		where: eq(nodesSchema.workflowId, workflow?.id),
	});
	const edges = await db.query.edges.findMany({
		where: eq(edgesSchema.workflowId, workflow?.id),
	});
	const responseJson: ResponseJson = {
		workflow: {
			...workflow,
			nodes,
			edges,
		},
	};

	return Response.json(responseJson);
};
