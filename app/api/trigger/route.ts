import { helloWorldTask } from "@/trigger/example";

export const GET = async () => {
	const handle = await helloWorldTask.trigger({});
	return Response.json(handle);
};
