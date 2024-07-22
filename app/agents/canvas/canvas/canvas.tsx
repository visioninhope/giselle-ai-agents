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
	// useSynthsize();
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const { addNodeAction } = useAddNodeAction();
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes = useNodeTypes();
	const blueprint = useBlueprint();
	const reactFlowInstance = useReactFlow();
	useEffect(() => {
		const nodes = blueprint.nodes.map(({ id, position }) => ({
			id: `${id}`,
			position,
			type: "input",
			data: {},
		}));
		reactFlowInstance.setNodes(nodes);
	}, [blueprint, reactFlowInstance]);
	const handleNodeSelect = useCallback(
		async (nodeClassName: NodeClassName) => {
			reactFlowInstance.setNodes([
				{
					id: "001",
					type: "input",
					position: {
						x: position.x,
						y: position.y,
					},
					data: {},
				},
			]);
			// hideContextMenu();
			// addNodeAction({
			// 	nodeClassName,
			// 	position,
			// });
		},
		[position, reactFlowInstance.setNodes],
	);
	return (
		<div className="flex-1" ref={containerRef}>
			<button type="button">add</button>
			<pre>{JSON.stringify(blueprint.nodes)}</pre>
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
