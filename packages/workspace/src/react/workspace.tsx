import type { Workspace } from "@giselle-sdk/data-type";
import { GenerationRunnerSystemProvider } from "@giselle-sdk/generation-runner/react";
import { RunSystemContextProvider } from "@giselle-sdk/run/react";
import { WorkflowDesignerProvider } from "@giselle-sdk/workflow-designer/react";
import type { ReactNode } from "react";

export interface WorkspaceProviderProps {
	children: ReactNode;
	defaultValue: Workspace;
}
export function WorkspaceProvider({
	defaultValue,
	children,
}: WorkspaceProviderProps) {
	return (
		<WorkflowDesignerProvider data={defaultValue}>
			<GenerationRunnerSystemProvider>
				<RunSystemContextProvider workspaceId={defaultValue.id}>
					{children}
				</RunSystemContextProvider>
			</GenerationRunnerSystemProvider>
		</WorkflowDesignerProvider>
	);
}
