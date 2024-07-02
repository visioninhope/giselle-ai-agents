import { findWorkflowBySlug } from "@/drizzle/db";
import { runWorkflow } from "./workflow-execution-engine";

export const GET = async (
	req: Request,
	{ params }: { params: { slug: string } },
) => {
	const workflow = await findWorkflowBySlug(params.slug);
	await runWorkflow(workflow);
	return Response.json({ workflow });
};
