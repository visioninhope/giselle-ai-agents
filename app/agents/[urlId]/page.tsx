import {
	BlueprintProvider,
	getBlueprint,
	getLatestBlueprint,
} from "@/app/agents/blueprints";
import { Canvas } from "@/app/agents/canvas";
import { revalidateTag, unstable_cache } from "next/cache";
import { Suspense } from "react";
import { ServerComponent } from "./server";

import "@xyflow/react/dist/style.css";
import { NodeClassesProvider, nodeClasses } from "@/app/node-classes";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getCachedBlueprint = unstable_cache(
	async (blueprintId) => getBlueprint(blueprintId),
	["get-blueprint"],
	{
		tags: ["get-user"],
	},
);
export default async function Page({ params }: { params: { urlId: string } }) {
	const latestBlueprint = await getLatestBlueprint(params.urlId);
	const blueprint = await getCachedBlueprint(latestBlueprint.id);
	const revalidate = async () => {
		"use server";
		await sleep(3000);
		revalidateTag("get-user");
	};
	return (
		<div className="w-screen h-screen flex flex-col">
			<section>
				{blueprint.id}
				<Suspense fallback={<p>loading...</p>}>
					<ServerComponent />
				</Suspense>
				<form action={revalidate}>
					<button type="submit">s</button>
				</form>
			</section>
			<BlueprintProvider blueprint={blueprint}>
				<NodeClassesProvider nodeClasses={nodeClasses}>
					<Canvas />
				</NodeClassesProvider>
			</BlueprintProvider>
		</div>
	);
}
