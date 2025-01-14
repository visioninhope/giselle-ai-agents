"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import type { z } from "zod";
import type { NodeData, WorkflowData } from "../workflow-data";
import type { CreateTextGenerationNodeParams } from "../workflow-data/node/text-generation";
import type { NodeId } from "../workflow-data/node/types";
import {
	WorkflowDesigner,
	type WorkflowDesignerOperations,
} from "./workflow-designer";

interface WorkflowDesignerContextValue
	extends Pick<
		WorkflowDesignerOperations,
		"addTextGenerationNode" | "updateNodeData"
	> {
	data: WorkflowData;
}
const WorkflowDesignerContext = createContext<
	WorkflowDesignerContextValue | undefined
>(undefined);

export function WorkflowDesignerProvider({
	children,
	data,
}: {
	children: React.ReactNode;
	data: WorkflowData;
}) {
	const workflowDesignerRef = useRef(
		WorkflowDesigner({
			defaultValue: data,
		}),
	);
	const [workflowData, setWorkflowData] = useState(data);
	const addTextGenerationNode = useCallback(
		(params: z.infer<typeof CreateTextGenerationNodeParams>) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.addTextGenerationNode(params);
			console.log(workflowDesignerRef.current.getData());
			setWorkflowData(workflowDesignerRef.current.getData());
		},
		[],
	);
	const updateNodeData = useCallback((nodeId: NodeId, data: NodeData) => {
		if (workflowDesignerRef.current === undefined) {
			return;
		}
		workflowDesignerRef.current.updateNodeData(nodeId, data);
		setWorkflowData(workflowDesignerRef.current.getData());
	}, []);

	return (
		<WorkflowDesignerContext.Provider
			value={{
				data: workflowData,
				addTextGenerationNode,
				updateNodeData,
			}}
		>
			{children}
		</WorkflowDesignerContext.Provider>
	);
}

export function useWorkflowDesigner() {
	const context = useContext(WorkflowDesignerContext);
	if (context === undefined) {
		throw new Error(
			"useWorkflowDesigner must be used within a WorkflowDesignerProvider",
		);
	}
	return context;
}

export function useNode(nodeId: NodeId) {
	const { data: workflowData, updateNodeData } = useWorkflowDesigner();

	const data = useMemo(() => {
		const node = workflowData.nodes.get(nodeId);
		if (node === undefined) {
			throw new Error(`Node with id ${nodeId} not found`);
		}
		return node;
	}, [workflowData, nodeId]);

	const updateData = useCallback(
		(newData: Partial<NodeData>) => {
			updateNodeData(nodeId, { ...data, ...newData });
		},
		[nodeId, updateNodeData, data],
	);
	return {
		updateData,
	};
}
