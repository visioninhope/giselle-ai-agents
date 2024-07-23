import { useBlueprint } from "@/app/agents/blueprints";
import type { FC } from "react";
import { RequestButton } from "./request-button";
import { RequiredAction } from "./required-action";

export const RequestPanel: FC = () => {
	const blueprint = useBlueprint();
	return (
		<div className="px-4">
			{blueprint.requiredActions && (
				<RequiredAction requiredActions={blueprint.requiredActions} />
			)}
			{(blueprint.requiredActions == null ||
				blueprint.requiredActions.length === 0) && <RequestButton />}
		</div>
	);
};
