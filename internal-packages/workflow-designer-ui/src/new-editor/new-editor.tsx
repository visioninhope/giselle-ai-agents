import type { Workspace } from "@giselle-sdk/data-type";
import { use } from "react";
import { DebugForm, DebugViewer } from "./debugger";
import { FlowDemo } from "./flow-demo";
import { NodeCanvas } from "./node-canvas";
import { EditorStoreProvider } from "./store/context";

export function NewEditor({
	workspace: workspacePromise,
}: {
	workspace: Promise<Workspace>;
}) {
	const workspace = use(workspacePromise);
	return (
		<EditorStoreProvider workspace={workspace}>
			<div className="min-h-screen flex flex-col gap-4">
				<div className="flex divide-x">
					<div className="flex-1">
						<DebugViewer />
					</div>
					<div className="flex-1">
						<DebugForm />
					</div>
				</div>
				<NodeCanvas />
				<FlowDemo />
			</div>
		</EditorStoreProvider>
	);
}
