import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type FC, useCallback, useRef } from "react";
import { useUpdateNode } from "../context/update-node";
import type { Node } from "../type";

type PropertyFieldProps = {
	name: string;
	label?: string;
	value: string;
	node: Node;
};
export const PropertyField: FC<PropertyFieldProps> = ({
	label,
	name,
	value,
	node,
}) => {
	const { updateNode } = useUpdateNode();
	const ref = useRef<HTMLTextAreaElement | null>(null);
	const handleBlur = useCallback(() => {
		if (ref.current == null) {
			return;
		}
		updateNode(node.id, {
			...node.data,
			[name]: value,
		});
	}, [name, node, value, updateNode]);
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
