"use client";

import { useBlueprint } from "@/app/agents/blueprints";
import type { NodeClassName } from "@/app/node-classes";
import {
	Background,
	ReactFlow,
	type ReactFlowInstance,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useContextMenu, useSynthsize } from "../hooks/";
import { NodeList, useNodeTypes } from "../node";
import { useAddNodeAction } from "./use-add-node-action";

const CanvasInner: FC = () => {
	useSynthsize();
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const { addNodeAction } = useAddNodeAction();
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes = useNodeTypes();
	const blueprint = useBlueprint();
	const reactFlowInstance = useReactFlow();
	const handleNodeSelect = useCallback(
		async (nodeClassName: NodeClassName) => {
			hideContextMenu();
			addNodeAction({
				nodeClassName,
				position,
			});
		},
		[position, hideContextMenu, addNodeAction],
	);
	return (
		<div className="flex-1" ref={containerRef}>
			<ReactFlow
				onContextMenu={handleContextMenu}
				nodeTypes={nodeTypes}
				defaultNodes={[]}
				defaultEdges={[]}
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
