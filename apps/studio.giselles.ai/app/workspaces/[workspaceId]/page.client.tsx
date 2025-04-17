"use client";

import {
	Editor,
	Header,
	SettingsView,
	Viewer,
} from "@giselle-internal/workflow-designer-ui";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { updateAgentName } from "./actions";

export default function Page({
	githubTools,
}: {
	githubTools: boolean;
}) {
	const { view } = useWorkflowDesigner();

	return (
		<div className="flex flex-col h-screen bg-black-900">
			<Header onWorkflowNameChange={updateAgentName} />
			{view === "editor" && <Editor githubTools={githubTools} />}
			{view === "viewer" && <Viewer />}
			{view === "integrator" && <SettingsView />}
		</div>
	);
}
