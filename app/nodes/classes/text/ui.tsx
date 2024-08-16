"use client";

import type { Node } from "@/app/agents/blueprints";
import { type FC, useMemo } from "react";
import { DynamicInputPort } from "../../components/dynamic-input-port";
import { PropertyField } from "../../components/property-field";

type TextNodePanelProps = {
	node: Node;
	textFieldName: string;
	textFieldValue: string;
};

export const TextNodePanel: FC<TextNodePanelProps> = ({
	node,
	textFieldName,
	textFieldValue,
}) => {
	return (
		<div className="divide-y">
			<div className="p-2">
				<PropertyField
					nodeId={node.id}
					name={textFieldName}
					value={textFieldValue}
					label="Text"
				/>
			</div>
			<div className="p-2">
				<DynamicInputPort node={node} heading="Text Parameters" />
			</div>
		</div>
	);
};
