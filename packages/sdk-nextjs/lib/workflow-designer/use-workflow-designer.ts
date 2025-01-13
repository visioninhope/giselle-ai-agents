import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import type { WorkflowData, WorkflowId } from "../workflow-data";
import type { CreateTextGenerationNodeParams } from "../workflow-data/node/text-generation";
import { useGetWorkflow } from "./use-get-workflow";
import { WorkflowDesigner } from "./workflow-designer";

interface LoadedWorkflowDesignerHelper {
	isLoading: false;
	workflowData: WorkflowData;
	addTextGenerationNode: (
		params: z.infer<typeof CreateTextGenerationNodeParams>,
	) => void;
}
interface LoadingWorkflowDesignerHelper {
	isLoading: true;
	workflowData: WorkflowData | undefined;
	addTextGenerationNode: (
		params: z.infer<typeof CreateTextGenerationNodeParams>,
	) => void;
}
type WorkflowDesignerHelper =
	| LoadedWorkflowDesignerHelper
	| LoadingWorkflowDesignerHelper;
export function useWorkflowDesigner({
	workflowId,
	getWorkflowApi = "/api/workflow/get-workflow",
}: {
	workflowId: WorkflowId;
	getWorkflowApi?: string;
}): WorkflowDesignerHelper {
	const { isLoading, data } = useGetWorkflow({
		workflowId,
		api: getWorkflowApi,
	});
	const workflowDesignerRef = useRef<WorkflowDesigner | undefined>(undefined);

	useEffect(() => {
		if (!isLoading && data) {
			workflowDesignerRef.current = WorkflowDesigner({
				defaultValue: data.workflowData,
			});
			setWorkflowData(data.workflowData);
		}
	}, [isLoading, data]);
	const [workflowData, setWorkflowData] = useState(data?.workflowData);
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
	if (isLoading || workflowData === undefined) {
		return {
			isLoading: true,
			workflowData,
			addTextGenerationNode,
		};
	}
	return {
		isLoading: false,
		workflowData,
		addTextGenerationNode,
	};
}
