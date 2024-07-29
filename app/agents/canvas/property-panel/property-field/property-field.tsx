import { updateNodeProperty, useBlueprint } from "@/app/agents/blueprints";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NodeProperty } from "@/drizzle";
import { type FC, useCallback, useRef } from "react";

type PropertyFieldProps = NodeProperty & {
	nodeId: string;
};
export const PropertyField: FC<PropertyFieldProps> = ({
	label,
	name,
	value,
	nodeId,
}) => {
	const { blueprint, mutate } = useBlueprint();
	const ref = useRef<HTMLTextAreaElement | null>(null);
	const handleBlur = useCallback(() => {
		if (ref.current == null) {
			return;
		}
		mutate({
			type: "updateNodeProperty",
			optimisticData: {
				node: {
					id: nodeId,
					property: {
						name,
						value: ref.current.value,
					},
				},
			},
			action: (optimisticData) =>
				updateNodeProperty({
					blueprintId: blueprint.id,
					...optimisticData,
					node: {
						...optimisticData.node,
						id: Number.parseInt(optimisticData.node.id, 10),
					},
				}).then((result) => ({
					...result,
					node: {
						...result.node,
						id: `${result.node.id}`,
					},
				})),
		});
	}, [name, nodeId, mutate, blueprint.id]);
	return (
		<div>
			<Label htmlFor={name}>{label ?? name}</Label>
			<Textarea
				name={name}
				id={name}
				defaultValue={value}
				ref={ref}
				onBlur={handleBlur}
			/>
		</div>
	);
};
