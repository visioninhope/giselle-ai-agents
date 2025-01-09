export async function POST() {
	return Response.json({ postGraph: "ok" });
}

export async function GET() {
	return Response.json({ getGraph: "ok" });
}
