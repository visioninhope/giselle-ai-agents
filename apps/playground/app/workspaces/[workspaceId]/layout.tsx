import { WorkspaceId } from "@giselle-sdk/data-type";
import { callGetWorkspaceApi } from "giselle-sdk";
import { WorkspaceProvider } from "giselle-sdk/react";
import type { ReactNode } from "react";

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ workspaceId: string }>;
	children: ReactNode;
}) {
	const data = await callGetWorkspaceApi({
		workspaceId: WorkspaceId.parse((await params).workspaceId),
	});
	return <WorkspaceProvider defaultValue={data}>{children}</WorkspaceProvider>;
}
