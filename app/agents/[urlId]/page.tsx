import {
	BlueprintProvider,
	getBlueprint,
	getLatestBlueprint,
} from "@/app/agents/blueprints";
import { Canvas } from "@/app/agents/canvas";

import "@xyflow/react/dist/style.css";
import { NodeClassesProvider, getNodeClasses } from "@/app/node-classes";

export default async function Page({ params }: { params: { urlId: string } }) {
	const latestBlueprint = await getLatestBlueprint(params.urlId);
	const blueprint = await getBlueprint(latestBlueprint.id);
	return (
		<div className="w-screen h-screen flex flex-col">
			<BlueprintProvider blueprint={blueprint}>
				<NodeClassesProvider nodeClasses={getNodeClasses()}>
					<Canvas />
				</NodeClassesProvider>
			</BlueprintProvider>
		</div>
	);
}
