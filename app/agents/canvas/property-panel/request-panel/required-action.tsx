import type { BlueprintRequiredAction } from "@/app/agents/blueprints";
import type { FC } from "react";

type RequiredActionProps = {
	requiredActions: BlueprintRequiredAction[];
};
export const RequiredAction: FC<RequiredActionProps> = ({
	requiredActions,
}) => {
	if (requiredActions.length < 1) {
		return null;
	}
	return (
		<div className="">
			<h2>Required Actions</h2>
			<ul>
				{requiredActions.map((action) => (
					<li key={action.type}>{action.type}</li>
				))}
			</ul>
		</div>
	);
};
