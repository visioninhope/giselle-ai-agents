"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface ResizableLayoutProps {
	mainContent: React.ReactNode;
	actsContent: React.ReactNode;
}

export function ResizableLayout({
	mainContent,
	actsContent,
}: ResizableLayoutProps) {
	return (
		<PanelGroup direction="horizontal" className="h-full">
			<Panel defaultSize={70} minSize={50}>
				{mainContent}
			</Panel>

			<PanelResizeHandle className="w-[3px] mx-3 bg-black-70/50 hover:bg-black-70 cursor-col-resize" />

			<Panel defaultSize={30} minSize={20} maxSize={50}>
				{actsContent}
			</Panel>
		</PanelGroup>
	);
}
