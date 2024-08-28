"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type OnSelectionChangeFunc,
	useOnSelectionChange,
} from "@xyflow/react";
import { type FC, useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { assertNodeClassName, nodeService } from "../../nodes";
import { useGraph } from "../graph-context";
// import { KnowledgeAccordion } from "./knowledge";
// import { RequestPanel } from "./request-panel";

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
					<TabsTrigger value="knowledges">Knowledges</TabsTrigger>
				</TabsList>

				<TabsContent value="properties" className="flex flex-col gap-2">
					{selectedNodes.length === 0 ? null : selectedNodes.length > 1 ? (
						<p>{selectedNodes.length} nodes selected</p>
					) : (
						<NodeModifyPanelInner nodeId={selectedNodes[0]} />
					)}
				</TabsContent>
				<TabsContent value="requests" className="flex flex-col gap-2">
					{/** <RequestPanel /> **/}
				</TabsContent>
				<TabsContent value="knowledges" className="flex flex-col gap-2">
					{/**<KnowledgeAccordion /> **/}
				</TabsContent>
			</Tabs>
		</div>
	);
};

type NodeModifyPanelInnerProps = {
	nodeId: string;
};
const NodeModifyPanelInner: FC<NodeModifyPanelInnerProps> = ({ nodeId }) => {
	const { graph } = useGraph();
	const Panel = useMemo(() => {
		const node = graph.nodes.find((node) => node.id === nodeId);
		if (node == null) {
			return null;
		}
		const className = node.className;
		assertNodeClassName(className);
		return nodeService.renderPanel(className, { node });
	}, [graph, nodeId]);
	return <div className="flex flex-col gap-2 py-2">{Panel}</div>;
};
