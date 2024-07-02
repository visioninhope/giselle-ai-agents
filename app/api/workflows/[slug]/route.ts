import { db, findWorkflowBySlug } from "@/drizzle/db";

export type ResponseJson = {
	workflow: Awaited<ReturnType<typeof findWorkflowBySlug>>;
};
export const GET = async (
	req: Request,
	{ params }: { params: { slug: string } },
) => {
	const workflow = await findWorkflowBySlug(params.slug);

	return Response.json({ workflow });
};
