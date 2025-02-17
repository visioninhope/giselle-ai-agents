import { useContext } from "react";
import { WorkflowDesignerContext } from "../workflow-designer-context";

export function useWorkflowDesigner() {
	const context = useContext(WorkflowDesignerContext);
	if (context === undefined) {
		throw new Error(
			"useWorkflowDesigner must be used within a WorkflowDesignerProvider",
		);
	}
	return context;
}

// export function useWorkflowDesigner(): WorkflowDesignerContextValue &
// 	ReturnType<typeof useGenerationController> {
// 	const context = useWorkflowDesignerContext();
// 	const generationControllerHelpers = useGenerationController();
// 	return {
// 		...context,
// 		...generationControllerHelpers,
// 	};
// }
