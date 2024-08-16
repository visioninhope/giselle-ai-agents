"use client";

import type { Node } from "@/app/agents/blueprints";
import type { FC } from "react";
import { DynamicOutputPort } from "../../components/dynamic-output-port";

type OnRequestNodePanelProps = {
	node: Node;
};
export const OnRequestNodePanel: FC<OnRequestNodePanelProps> = ({ node }) => {
	return (
		<div className="divide-y">
			<div className="p-2">
				<DynamicOutputPort node={node} heading="Parameters" />
			</div>
		</div>
	);
};
