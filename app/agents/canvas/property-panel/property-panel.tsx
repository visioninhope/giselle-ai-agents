"use client";

import { type Node, useNode } from "@/app/agents/blueprints";
import { findNodeClass, useNodeClasses } from "@/app/node-classes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FC, useMemo } from "react";
import { match } from "ts-pattern";
import { DynamicInputPort } from "./dynamic-input-port";
import { DynamicOutputPort } from "./dynamic-output-port";
import { PropertyField } from "./property-field";
import { RequestPanel } from "./request-panel";

type PropertyPanel = {
	selectedNodes: Node[];
};
export const PropertyPanel: FC<PropertyPanel> = ({ selectedNodes }) => {
	return (
		<div className="bg-background/60 border border-border w-[400px] text-sm">
			<Tabs defaultValue="requests">
				<TabsList>
					<TabsTrigger value="requests" className="font-bold">
						Requests
					</TabsTrigger>
					<TabsTrigger value="properties" className="font-bold">
						Properties
					</TabsTrigger>
				</TabsList>

				<TabsContent value="properties" className="py-2 flex flex-col gap-2">
					{selectedNodes.length === 0 ? null : selectedNodes.length > 1 ? (
						<p>{selectedNodes.length} nodes selected</p>
					) : (
						<NodeModifyPanelInner node={selectedNodes[0]} />
					)}
				</TabsContent>
				<TabsContent value="requests" className="py-2 flex flex-col gap-2">
					<RequestPanel />
				</TabsContent>
			</Tabs>
		</div>
	);
};

type NodeModifyPanelInnerProps = {
	node: Node;
};
const NodeModifyPanelInner: FC<NodeModifyPanelInnerProps> = ({ node }) => {
	const nodeClasses = useNodeClasses();
	const nodeClass = useMemo(
		() => findNodeClass(nodeClasses, node.className),
		[nodeClasses, node.className],
	);
	const blueprintNode = useNode(node.id);
	if (blueprintNode == null) {
		return null;
	}
	return (
		<div className="flex flex-col gap-2">
			{blueprintNode.properties.length > 0 && (
				<>
					<div className="px-4">
						{blueprintNode.properties?.map((property) => (
							<PropertyField
								key={`${blueprintNode.id}-${property.name}`}
								nodeId={node.id}
								{...property}
							/>
						))}
					</div>
					<hr className="my-4" />
				</>
			)}
			<div>
				{nodeClass.features?.map((feature) =>
					match(feature)
						.with({ name: "dynamicOutputPort" }, () => (
							<DynamicOutputPort
								node={blueprintNode}
								key={`${blueprintNode.id}-${feature.name}`}
							/>
						))
						.with({ name: "dynamicInputPort" }, () => (
							<DynamicInputPort
								node={blueprintNode}
								key={`${blueprintNode.id}-${feature.name}`}
							/>
						))
						.exhaustive(),
				)}
			</div>
		</div>
	);
};
