"use client";

import type { FC } from "react";
import { DynamicOutputPort } from "../../components/dynamic-output-port";
import type { PanelProps } from "../../type";

export const Panel: FC<PanelProps> = ({ node }) => {
	return (
		<div className="px-4">
			<DynamicOutputPort node={node} heading="Parameters" />
		</div>
	);
};
