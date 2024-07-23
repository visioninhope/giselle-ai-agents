import {
	BlueprintProvider,
	getBlueprint,
	getLatestBlueprint,
} from "@/app/agents/blueprints";

import "@xyflow/react/dist/style.css";
import { NodeClassesProvider, getNodeClasses } from "@/app/node-classes";
export default async function Layout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: { urlId: string };
}>) {
	const latestBlueprint = await getLatestBlueprint(params.urlId);
	const blueprint = await getBlueprint(latestBlueprint.id);
	return (
		<div className="w-screen h-screen flex flex-col">
			<BlueprintProvider blueprint={blueprint}>
				<NodeClassesProvider nodeClasses={getNodeClasses()}>
					{children}
				</NodeClassesProvider>
			</BlueprintProvider>
		</div>
	);
}
