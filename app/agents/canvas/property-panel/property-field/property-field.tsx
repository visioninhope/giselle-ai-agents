import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NodeProperty } from "@/drizzle";
import type { FC } from "react";

type PropertyFieldProps = NodeProperty;
export const PropertyField: FC<PropertyFieldProps> = ({
	label,
	name,
	value,
}) => {
	return (
		<div>
			<Label htmlFor={name}>{label ?? name}</Label>
			<Input type="text" name={name} id={name} defaultValue={value} />
		</div>
	);
};
