"use client";

import { Button } from "@/components/ui/button";
import { createAgent } from "@/services/agents";
import { type FC, useActionState } from "react";
import { useCreateAgentButtonContext } from "./context";

export const CreateAgentButton: FC = () => {
	const { userId, onCreateAgentEnd } = useCreateAgentButtonContext();
	const [_, action, isPending] = useActionState(async () => {
		const agent = await createAgent({
			userId,
		});
		onCreateAgentEnd(agent.id);
	}, null);
	return (
		<form action={action}>
			<Button type="submit" disabled={isPending}>
				Create new agent
			</Button>
		</form>
	);
};
