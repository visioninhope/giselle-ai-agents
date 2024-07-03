import { db, findWorkspaceBySlug } from "@/drizzle/db";

export type ResponseJson = {
	workflow: Awaited<ReturnType<typeof findWorkspaceBySlug>>;
};
export const GET = async (
	req: Request,
	{ params }: { params: { slug: string } },
) => {
	const workflow = await findWorkspaceBySlug(params.slug);

	return Response.json({ workflow });
};
