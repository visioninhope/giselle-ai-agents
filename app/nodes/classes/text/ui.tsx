"use client";

import { type FC, useMemo } from "react";
import { DynamicInputPort } from "../../components/dynamic-input-port";
import { PropertyField } from "../../components/property-field";
import type { PanelProps } from "../../type";

export const Panel: FC<PanelProps> = ({ node }) => {
	return (
		<div className="divide-y">
			<div className="p-2">
				<PropertyField
					nodeId={node.id}
					name="content"
					value={(node.data?.content as string) ?? ""}
					label="Text"
				/>
			</div>
			<div className="p-2">
				<DynamicInputPort node={node} heading="Text Parameters" />
			</div>
		</div>
	);
};
