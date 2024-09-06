import type { FC, HTMLInputTypeAttribute } from "react";
import { Input } from "./input";
import { Label } from "./label";

type FieldProps = {
	name: string;
	type: HTMLInputTypeAttribute;
	required?: boolean;
	label: string;
};
export const Field: FC<FieldProps> = ({ name, type, required, label }) => (
	<div className="grid gap-[4px]">
		<Label htmlFor={name}>{label}</Label>
		<Input id={name} type={type} name={name} required={required} />
	</div>
);
