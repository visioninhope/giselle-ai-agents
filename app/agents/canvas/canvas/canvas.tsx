"use client";

import type { NodeClassName } from "@/app/node-classes";
import {
	Background,
	ReactFlow,
	type ReactFlowInstance,
	ReactFlowProvider,
} from "@xyflow/react";
import { type FC, useCallback, useRef, useState } from "react";
import { useContextMenu, useSynthsize } from "../hooks/";
import { NodeList } from "../node-list";

const CanvasInner: FC = () => {
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	useSynthsize();
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const containerRef = useRef<HTMLDivElement>(null);

	const handleNodeSelect = useCallback(
		(nodeClassName: NodeClassName) => {},
		[],
	);
	return (
		<div className="flex-1" ref={containerRef}>
			<ReactFlow
				onContextMenu={handleContextMenu}
				onInit={setReactFlowInstance}
			>
				<Background />
				{isVisible && (
					<div
						className="z-10 absolute"
						style={{
							left: position.x - (containerRef?.current?.offsetLeft ?? 0),
							top: position.y - (containerRef?.current?.offsetTop ?? 0),
						}}
					>
						<NodeList onSelect={handleNodeSelect} />
					</div>
				)}
			</ReactFlow>
		</div>
	);
};

export const Canvas: FC = () => (
	<ReactFlowProvider>
		<CanvasInner />
	</ReactFlowProvider>
);
