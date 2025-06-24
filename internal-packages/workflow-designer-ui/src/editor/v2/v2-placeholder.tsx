"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useCallback, useState } from "react";
import { ReadOnlyBanner } from "../../ui/read-only-banner";
import { ToastProvider } from "../../ui/toast";
import { MousePositionProvider, ToolbarContextProvider } from "../tool";
import { V2Container, V2Footer, V2Header } from "./components";

export function V2Placeholder({
	isReadOnly = false,
	userRole = "viewer",
}: {
	isReadOnly?: boolean;
	userRole?: "viewer" | "guest" | "editor" | "owner";
}) {
	const [showReadOnlyBanner, setShowReadOnlyBanner] = useState(isReadOnly);
	const [activeTab, setActiveTab] = useState("builder");

	const handleDismissBanner = useCallback(() => {
		setShowReadOnlyBanner(false);
	}, []);

	const handleTabChange = useCallback((tab: string) => {
		setActiveTab(tab);
	}, []);

	return (
		<div className="flex-1 overflow-hidden font-sans pl-[16px] flex flex-col">
			{showReadOnlyBanner && isReadOnly && (
				<ReadOnlyBanner
					onDismiss={handleDismissBanner}
					userRole={userRole}
					className="z-50"
				/>
			)}

			<ToastProvider>
				<ReactFlowProvider>
					<ToolbarContextProvider>
						<MousePositionProvider>
							<V2Header />
							<V2Container activeTab={activeTab} />
							<V2Footer onTabChange={handleTabChange} />
						</MousePositionProvider>
					</ToolbarContextProvider>
				</ReactFlowProvider>
			</ToastProvider>
		</div>
	);
}
