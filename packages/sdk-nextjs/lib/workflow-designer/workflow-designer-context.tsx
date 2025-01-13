"use client";

import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";
import type { z } from "zod";
import type { WorkflowData } from "../workflow-data";
import type { CreateTextGenerationNodeParams } from "../workflow-data/node/text-generation";
import {
	WorkflowDesigner,
	type WorkflowDesignerOperations,
} from "./workflow-designer";

interface WorkflowDesignerContextValue extends WorkflowDesignerOperations {
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
			setWorkflowData(workflowDesignerRef.current.getData());
		},
		[],
	);

	return (
		<WorkflowDesignerContext.Provider
			value={{
				data: workflowData,
				addTextGenerationNode,
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
