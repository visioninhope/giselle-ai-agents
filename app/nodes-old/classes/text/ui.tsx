"use client";

import { type FC, useMemo } from "react";
import invariant from "tiny-invariant";
import { DynamicInputPort } from "../../components/dynamic-input-port";
import { DynamicOutputPort } from "../../components/dynamic-output-port";
import { PropertyField } from "../../components/property-field";
import type { PanelProps } from "../../type";

export const Panel: FC<PanelProps> = ({ node }) => {
	const textProperty = useMemo(() => {
		const prop = node.properties.find((property) => property.name === "text");
		invariant(
			prop != null,
			`Not found "text" property in ${JSON.stringify(node.properties)}`,
		);
		return prop;
	}, [node.properties]);
	return (
		<div className="divide-y">
			<div className="p-2">
				<PropertyField
					nodeId={node.id}
					name="text"
					value={textProperty.value}
					label={textProperty.label}
				/>
			</div>
			<div className="p-2">
				<DynamicInputPort node={node} heading="Text Parameters" />
			</div>
		</div>
	);
};
