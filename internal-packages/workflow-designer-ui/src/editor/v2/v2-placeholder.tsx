"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { Tabs } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type ImperativePanelHandle,
	Panel,
	PanelGroup,
	PanelResizeHandle,
} from "react-resizable-panels";
import "@xyflow/react/dist/style.css";
import clsx from "clsx/lite";
import Link from "next/link";
import { GiselleLogo } from "../../icons";
import { ReadOnlyBanner } from "../../ui/read-only-banner";
import { ToastProvider } from "../../ui/toast";
import { DataSourceTable } from "../data-source";
import { PropertiesPanel } from "../properties-panel";
import { EditableText } from "../properties-panel/ui";
import { RunHistoryTable } from "../run-history/run-history-table";
import { SecretTable } from "../secret/secret-table";

import {
	MousePositionProvider,
	Toolbar,
	ToolbarContextProvider,
} from "../tool";

function V2Header() {
	const { updateName, data } = useWorkflowDesigner();
	const handleChange = useCallback(
		(value?: string) => {
			if (!value) {
				return;
			}
			updateName(value);
		},
		[updateName],
	);

	return (
		<header className="bg-surface-background border-b border-border px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link href="/">
						<GiselleLogo className="fill-text w-[70px] h-auto" />
					</Link>
					<EditableText
						fallbackValue="Untitled"
						onChange={handleChange}
						value={data.name}
						size="large"
					/>
				</div>
				<div className="flex items-center space-x-4">
					<button
						type="button"
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Run
					</button>
				</div>
			</div>
		</header>
	);
}

function V2Container({ activeTab }: { activeTab: string }) {
	const { data } = useWorkflowDesigner();
	const selectedNodes = useMemo(
		() =>
			Object.entries(data.ui.nodeState)
				.filter(([_, nodeState]) => nodeState?.selected)
				.map(([nodeId]) => data.nodes.find((node) => node.id === nodeId))
				.filter((node) => node !== undefined),
		[data],
	);

	const rightPanelRef = useRef<ImperativePanelHandle>(null);

	useEffect(() => {
		const rightPanel = rightPanelRef.current;
		if (!rightPanel) return;

		if (selectedNodes.length === 1) {
			rightPanel.resize(30);
		} else {
			rightPanel.resize(0);
		}
	}, [selectedNodes]);

	return (
		<main className="flex-1 bg-black-900 overflow-hidden">
			<Tabs.Root value={activeTab} asChild>
				<div className="h-full flex px-[16px] py-[16px]">
					<div className="flex-1 border border-border rounded-[12px]">
						<Tabs.Content value="builder" className="h-full">
							<PanelGroup direction="horizontal">
								<Panel>
									<div className="h-full bg-surface-background relative">
										<div className="h-full flex items-center justify-center">
											<div className="text-center">
												<div className="w-16 h-16 mx-auto mb-4 bg-black-100 rounded-full flex items-center justify-center">
													<svg
														className="w-8 h-8 text-black-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														role="img"
														aria-label="Workflow canvas"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
														/>
													</svg>
												</div>
												<h3 className="text-lg font-medium text-text mb-2">
													Workflow Canvas
												</h3>
												<p className="text-text-subtle">
													Enhanced layout with improved performance and user
													experience.
												</p>
											</div>
										</div>
										<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
											<Toolbar />
										</div>
									</div>
								</Panel>
								<PanelResizeHandle
									className={clsx(
										"w-[1px] bg-border cursor-col-resize",
										"data-[resize-handle-state=hover]:bg-[#4a90e2]",
										"opacity-0 data-[right-panel=show]:opacity-100 transition-opacity",
									)}
									data-right-panel={
										selectedNodes.length === 1 ? "show" : "hide"
									}
								/>
								<Panel
									id="right-panel"
									className="flex bg-surface-background"
									ref={rightPanelRef}
									defaultSize={0}
									data-right-panel={
										selectedNodes.length === 1 ? "show" : "hide"
									}
								>
									{selectedNodes.length === 1 && (
										<div className="flex-1 overflow-hidden">
											<PropertiesPanel />
										</div>
									)}
								</Panel>
							</PanelGroup>
						</Tabs.Content>

						<Tabs.Content value="secret" className="h-full outline-none">
							<SecretTable />
						</Tabs.Content>

						<Tabs.Content value="data-source" className="h-full outline-none">
							<DataSourceTable />
						</Tabs.Content>

						<Tabs.Content value="run-history" className="h-full outline-none">
							<RunHistoryTable />
						</Tabs.Content>
					</div>
				</div>
			</Tabs.Root>
		</main>
	);
}

function V2Footer({ onTabChange }: { onTabChange: (tab: string) => void }) {
	return (
		<footer className="bg-surface-background border-t border-border px-6 py-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-6">
					<div className="flex items-center space-x-4">
						<button
							type="button"
							onClick={() => onTabChange("run-history")}
							className="text-sm text-text-subtle hover:text-text cursor-pointer"
						>
							Run History
						</button>
						<button
							type="button"
							onClick={() => onTabChange("secret")}
							className="text-sm text-text-subtle hover:text-text cursor-pointer"
						>
							Secrets
						</button>
						<button
							type="button"
							onClick={() => onTabChange("data-source")}
							className="text-sm text-text-subtle hover:text-text cursor-pointer"
						>
							Data Source
						</button>
					</div>
					<div className="flex items-center space-x-4">
						<span className="text-sm text-text-subtle">Status: Ready</span>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-green-500 rounded-full" />
							<span className="text-sm text-text-subtle">Connected</span>
						</div>
					</div>
				</div>
				<div className="flex items-center space-x-4">
					<span className="text-sm text-text-subtle">
						Nodes: 0 | Connections: 0
					</span>
					<button
						type="button"
						className="text-sm text-text-subtle hover:text-text"
					>
						Help
					</button>
				</div>
			</div>
		</footer>
	);
}

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
