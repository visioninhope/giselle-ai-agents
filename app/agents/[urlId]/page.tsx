import { Canvas } from "@/app/agents/canvas";
import { headers } from "next/headers";

export default async function Page() {
	const ip = headers().get("x-forwared-for");
	console.log(JSON.stringify({ ip }));
	return <Canvas />;
}
