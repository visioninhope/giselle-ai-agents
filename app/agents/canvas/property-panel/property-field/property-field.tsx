import { useUpdateNodeProperty } from "@/app/agents/blueprints";
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
	const { updateNodeProperties } = useUpdateNodeProperty();
	const ref = useRef<HTMLInputElement | null>(null);
	const handleBlur = useCallback(() => {
		if (ref.current == null) {
			return;
		}
		updateNodeProperties({
			nodeId,
			property: {
				name,
				value: ref.current.value,
			},
		});
	}, [name, nodeId, updateNodeProperties]);
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
