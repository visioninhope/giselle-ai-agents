// import { useBlueprint } from "@/app/agents/blueprints";
// import { useRequest } from "@/app/agents/requests";
// import type { FC } from "react";
// import { RequestButton } from "./request-button";
// import { RequestLogger } from "./request-logger";
// import { RequiredAction } from "./required-action";

import { SubmitButton } from "@/components/ui/submit-button";
import { nodeClassHasCategory } from "@/services/agents/nodes";
import { nodeClassCategory } from "@/services/agents/nodes/type";
import { meta } from "@/services/agents/requests/actors/meta";
import {
	getOrBuildBlueprint,
	startRequest,
} from "@/services/agents/requests/process";
import type { AgentId } from "@/services/agents/types";
import { type FC, type FormEventHandler, useCallback } from "react";
import { useGraph } from "../../graph-context";

// export const RequestPanel: FC = () => {
// 	const { blueprint } = useBlueprint();
// 	const request = useRequest();
// 	return (
// 		<div className="px-4 py-2">
// 			{request != null && (
// 				<div className="mb-4 pb-4 border-b border-border">
// 					<RequestLogger request={request} />
// 				</div>
// 			)}
// 			{blueprint.requiredActions && (
// 				<RequiredAction requiredActions={blueprint.requiredActions} />
// 			)}
// 			{request != null && <p>New request</p>}
// 			{(blueprint.requiredActions == null ||
// 				blueprint.requiredActions.length === 0) && <RequestButton />}
// 		</div>
// 	);
// };

export const RequestPanel: FC = () => {
	const { agentId } = useGraph();
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault();
			const blueprint = await getOrBuildBlueprint(agentId as AgentId);
			console.log({ blueprint });
			const request = await startRequest(blueprint.id);
			await meta({ requestDbId: request.dbId });
		},
		[agentId],
	);
	return (
		<div className="px-4 py-2">
			<p>Request panel</p>
			<form onSubmit={handleSubmit}>
				<SubmitButton type="submit">Submit</SubmitButton>
				<input type="hidden" value={agentId} name="agentId" />
			</form>
		</div>
	);
};
