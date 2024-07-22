"use client";

import {
	addNode,
	useBlueprint,
	useBlueprintOptimisticAction,
} from "@/app/agents/blueprints";
import type { NodeClassName } from "@/app/node-classes";
import {
	Background,
	ReactFlow,
	type ReactFlowInstance,
	ReactFlowProvider,
} from "@xyflow/react";
import { type FC, useCallback, useRef, useState } from "react";
import { useContextMenu, useSynthsize } from "../hooks/";
import { NodeList, useNodeTypes } from "../node";

const CanvasInner: FC = () => {
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	useSynthsize();
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const containerRef = useRef<HTMLDivElement>(null);
	const blueprint = useBlueprint();
	const setOptimisticBlueprint = useBlueprintOptimisticAction();
	const nodeTypes = useNodeTypes();

	const handleNodeSelect = useCallback(
		async (nodeClassName: NodeClassName) => {
			hideContextMenu();

			if (reactFlowInstance == null) {
				return;
			}

			// reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
			// and you don't need to subtract the reactFlowBounds.left/top anymore
			// details: https://reactflow.dev/whats-new/2023-11-10
			const flowPosition = reactFlowInstance.screenToFlowPosition({
				x: position.x,
				y: position.y,
			});
			setOptimisticBlueprint({
				...blueprint,
			});
			await addNode({
				blueprintId: blueprint.id,
				node: {
					className: nodeClassName,
					position: { x: flowPosition.x, y: flowPosition.y },
				},
			});
		},
		[
			blueprint,
			hideContextMenu,
			position,
			reactFlowInstance,
			setOptimisticBlueprint,
		],
	);
	return (
		<div className="flex-1" ref={containerRef}>
			<ReactFlow
				onContextMenu={handleContextMenu}
				onInit={setReactFlowInstance}
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
