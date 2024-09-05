"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { type FC, useActionState, useMemo } from "react";
import { portDirection } from "../../nodes";
import { portType } from "../../nodes/types";
import type { PlaygroundGraph } from "../../playground/types";
import { buildPlaygroundGraph, createRequest } from "../actions";
import { useRequest } from "../context";
import { getTriggerNode } from "../helpers";
import type { BuildAndRequestActionError } from "./build-and-request-action";

type RequestTriggerProps = {
	playgroundGraph: PlaygroundGraph;
};
export const RequestButton: FC<RequestTriggerProps> = ({ playgroundGraph }) => {
	const { agentId } = useRequest();
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
	const [state, action, isPending] = useActionState(
		async (
			prevState: BuildAndRequestActionError | null,
			formData: FormData,
		) => {
			const inputRequestParameters = requestParameters
				?.map(({ id }) => {
					const value = formData.get(id);
					if (value == null) {
						return null;
					}
					return { key: id, value: value.toString() };
				})
				.filter((i) => i !== null);
			const build = await buildPlaygroundGraph(agentId);
			const request = await createRequest(build.id);
			return null;
		},
		null,
	);
	if (requestParameters == null || requestParameters.length === 0) {
		return (
			<form action={action}>
				<Button type="submit" disabled={isPending}>
					Request
				</Button>
			</form>
		);
	}
	return (
		<form action={action} className="grid gap-[16px]">
			{requestParameters.map(({ id, name }) => (
				<Field key={id} name={id} label={name} type="text" required />
			))}
			<Button type="submit" disabled={isPending}>
				Request
			</Button>
		</form>
	);
};
