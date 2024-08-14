import { updateNodeData, useBlueprint } from "@/app/agents/blueprints";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NodeData } from "@/drizzle";
import { type FC, useCallback, useRef } from "react";

type PropertyFieldProps = {
	name: string;
	label?: string;
	value: string;
	nodeId: number;
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
			type: "updateNodeData",
			optimisticData: {
				node: {
					id: nodeId,
					data: {
						name,
						value: ref.current.value,
					},
				},
			},
			action: (optimisticData) =>
				updateNodeData({
					blueprintId: blueprint.id,
					...optimisticData,
				}),
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
