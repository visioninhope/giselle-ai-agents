import { useBlueprint } from "@/app/agents/blueprints";
import { useRequest } from "@/app/agents/requests";
import type { FC } from "react";
import { RequestButton } from "./request-button";
import { RequestLogger } from "./request-logger";
import { RequiredAction } from "./required-action";

export const RequestPanel: FC = () => {
	const blueprint = useBlueprint();
	const request = useRequest();
	return (
		<div className="px-4">
			{blueprint.requiredActions && (
				<RequiredAction requiredActions={blueprint.requiredActions} />
			)}
			{(blueprint.requiredActions == null ||
				blueprint.requiredActions.length === 0) && <RequestButton />}
			{request != null && <RequestLogger request={request} />}
		</div>
	);
};
