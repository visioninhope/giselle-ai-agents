"use client";

import { type Node, useBlueprint } from "@/app/agents/blueprints";
import { findNodeClass, useNodeClasses } from "@/app/node-classes";
import { getNodeClass } from "@/app/nodes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type OnSelectionChangeFunc,
	useOnSelectionChange,
} from "@xyflow/react";
import { type FC, useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";
import { DynamicInputPort } from "./dynamic-input-port";
import { DynamicOutputPort } from "./dynamic-output-port";
import { PropertyField } from "./property-field";
import { RequestPanel } from "./request-panel";

export const PropertyPanel: FC = () => {
	const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
	const [_, setSelectedEdges] = useState<string[]>([]);

	// the passed handler has to be memoized, otherwise the hook will not work correctly
	const onChange = useCallback<OnSelectionChangeFunc>(({ nodes, edges }) => {
		setSelectedNodes(nodes.map((node) => node.id));
		setSelectedEdges(edges.map((edge) => edge.id));
	}, []);

	useOnSelectionChange({
		onChange,
	});
	return (
		<div className="bg-background border border-border w-[400px] text-sm">
			<Tabs defaultValue="requests" className="divide-y">
				<TabsList>
					<TabsTrigger value="requests">Requests</TabsTrigger>
					<TabsTrigger value="properties">Properties</TabsTrigger>
					<TabsTrigger value="storages">Storages</TabsTrigger>
				</TabsList>

				<TabsContent value="properties" className="flex flex-col gap-2">
					{selectedNodes.length === 0 ? null : selectedNodes.length > 1 ? (
						<p>{selectedNodes.length} nodes selected</p>
					) : (
						<NodeModifyPanelInner nodeId={Number.parseInt(selectedNodes[0])} />
					)}
				</TabsContent>
				<TabsContent value="requests" className="flex flex-col gap-2">
					<RequestPanel />
				</TabsContent>
				<TabsContent
					value="storages"
					className="flex flex-col gap-2"
				></TabsContent>
			</Tabs>
		</div>
	);
};

type NodeModifyPanelInnerProps = {
	nodeId: number;
};
const NodeModifyPanelInner: FC<NodeModifyPanelInnerProps> = ({ nodeId }) => {
	const { blueprint } = useBlueprint();
	const blueprintNode = useMemo(() => {
		const node = blueprint.nodes.find((node) => node.id === nodeId);
		invariant(node != null, `Not found node with id ${nodeId} in blueprint`);
		return node;
	}, [blueprint.nodes, nodeId]);

	const nodeClass = useMemo(
		() => getNodeClass({ name: blueprintNode.className }),
		[blueprintNode.className],
	);
	return (
		<div className="flex flex-col gap-2 py-2">
			{<nodeClass.Panel node={blueprintNode} />}
			{
				// {blueprintNode.properties.length > 0 && (
				// 	<>
				// 		<div className="px-4">
				// 			{blueprintNode.properties?.map((property) => (
				// 				<PropertyField
				// 					key={`${blueprintNode.id}-${property.name}`}
				// 					nodeId={node.id}
				// 					{...property}
				// 				/>
				// 			))}
				// 		</div>
				// 		<hr className="my-4" />
				// 	</>
				// )}
				// <div>
				// 	{nodeClass.features?.map((feature) =>
				// 		match(feature)
				// 			.with({ name: "dynamicOutputPort" }, () => (
				// 				<DynamicOutputPort
				// 					node={blueprintNode}
				// 					key={`${blueprintNode.id}-${feature.name}`}
				// 				/>
				// 			))
				// 			.with({ name: "dynamicInputPort" }, () => (
				// 				<DynamicInputPort
				// 					node={blueprintNode}
				// 					key={`${blueprintNode.id}-${feature.name}`}
				// 				/>
				// 			))
				// 			.exhaustive(),
				// 	)}
				// </div>
			}
		</div>
	);
};
