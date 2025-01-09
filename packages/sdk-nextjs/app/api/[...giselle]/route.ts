export async function POST(
	request: Request,
	{ params }: { params: Promise<{ giselle: string[] }> },
) {
	const { giselle } = await params;
	return Response.json({ command: giselle });
}

export async function GET() {
	return Response.json({ getGraph: "ok" });
}
