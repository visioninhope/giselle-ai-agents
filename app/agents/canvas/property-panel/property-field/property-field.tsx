import {
	updateNodeProperty,
	useBlueprint,
	useBlueprintMutation,
} from "@/app/agents/blueprints";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
	const { mutateBlueprint } = useBlueprintMutation();
	const blueprint = useBlueprint();
	const ref = useRef<HTMLInputElement | null>(null);
	const handleBlur = useCallback(() => {
		if (ref.current == null) {
			return;
		}
		mutateBlueprint({
			optimisticAction: {
				type: "updateNodeProperty",
				node: {
					nodeId,
					property: {
						name,
						value: ref.current.value,
					},
				},
			},
			mutation: updateNodeProperty({
				blueprintId: blueprint.id,
				nodeId: Number.parseInt(nodeId, 10),
				property: {
					name,
					value: ref.current.value,
				},
			}),
			action: ({ property }) => ({
				type: "updateNodeProperty",
				node: {
					nodeId,
					property,
				},
			}),
		});
	}, [name, nodeId, mutateBlueprint, blueprint.id]);
	return (
		<div>
			<Label htmlFor={name}>{label ?? name}</Label>
			<Input
				type="text"
				name={name}
				id={name}
				defaultValue={value}
				ref={ref}
				onBlur={handleBlur}
			/>
		</div>
	);
};
