"use client";
import { workflowId } from "@/lib/workflow-data";
import { useGetWorkflow } from "@/lib/workflow-designer/use-get-workflow";
import { useParams } from "next/navigation";
import { z } from "zod";

const Params = z.object({
	workflowId: workflowId.schema,
});

export default function Page() {
	const unsafeParams = useParams();
	const params = Params.parse(unsafeParams);
	const { isLoading, data } = useGetWorkflow({
		workflowId: params.workflowId,
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}
	return (
		<div className="grid grid-cols-[250px_1fr]">
			<div>
				<button type="button">add node</button>
			</div>
			<div>{JSON.stringify(data)}</div>
		</div>
	);
}
