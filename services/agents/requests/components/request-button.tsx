"use client";

import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { type FC, useActionState, useCallback, useMemo } from "react";
import { portDirection } from "../../nodes";
import { portType } from "../../nodes/types";
import type { PlaygroundGraph } from "../../playground/types";
import { useRequest } from "../context";
import { getTriggerNode } from "../helpers";

type RequestTriggerProps = {
	playgroundGraph: PlaygroundGraph;
};
export const RequestButton: FC<RequestTriggerProps> = ({ playgroundGraph }) => {
	const { requestStartAction } = useRequest();
	const [state, action] = useActionState(() => {}, null);
	const requestParameters = useMemo(() => {
		const triggerNode = getTriggerNode(playgroundGraph);
		if (triggerNode == null) {
			return null;
		}
		return triggerNode.ports.filter(
			({ direction, type }) =>
				direction === portDirection.source && type === portType.data,
		);
	}, [playgroundGraph]);
	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			requestStartAction();
		},
		[requestStartAction],
	);
	if (requestParameters == null || requestParameters.length === 0) {
		return (
			<form onSubmit={handleSubmit}>
				<pre>{JSON.stringify(requestParameters, null, 2)}</pre>
				<SubmitButton pendingNode={"Requesting..."}>Request</SubmitButton>
			</form>
		);
	}
	return (
		<form action={action} className="grid gap-[16px]">
			{requestParameters.map(({ id, name }) => (
				<Field key={id} name={name} label={name} type="text" required />
			))}
			<SubmitButton pendingNode={"Requesting..."}>Request</SubmitButton>
		</form>
	);
};
