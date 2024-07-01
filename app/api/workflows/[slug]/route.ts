import { db } from "@/drizzle/db";
import { nodesSchema, workflows } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const GET = async (
	req: Request,
	{ params }: { params: { slug: string } },
) => {
	const n = await db.query.nodesSchema.findFirst({
		where: eq(nodesSchema.id, 1),
		with: {
			workflows: true,
		},
	});
	// const workflow = await db.query.workflows.findFirst({
	// 	where: eq(workflows.slug, params.slug),
	// 	with: {
	// 		nodes: true,
	// 		edges: true,
	// 	},
	// });
	// return Response.json({
	// 	workflow,
	// });
	console.log(n);
	return Response.json({
		n,
	});
};
