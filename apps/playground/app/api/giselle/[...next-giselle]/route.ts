import { giselleEngine } from "@/giselle-engine";

// export const { GET, POST } = giselleEngine.handlers;
//

export const GET = () => {
	return Response.json({ hello: "world" });
};

export const POST = giselleEngine.handlers.POST;
