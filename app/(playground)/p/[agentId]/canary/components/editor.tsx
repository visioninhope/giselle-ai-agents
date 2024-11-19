"use client";

import {
	Background,
	BackgroundVariant,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";

export function Editor() {
	return (
		<ReactFlowProvider>
			<EditorInner />
		</ReactFlowProvider>
	);
}

function EditorInner() {
	return (
		<div className="w-full h-screen">
			<ReactFlow colorMode="dark">
				<Background
					className="!bg-black-100"
					lineWidth={0}
					variant={BackgroundVariant.Lines}
					style={{
						backgroundImage: `url(${bg.src})`,
						backgroundPositionX: "center",
						backgroundPositionY: "center",
						backgroundSize: "cover",
					}}
				/>
			</ReactFlow>
		</div>
	);
}
