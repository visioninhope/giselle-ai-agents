"use client";

import { useWorkflowDesigner } from "giselle-sdk/react";
import Link from "next/link";
import { useCallback } from "react";
import { GiselleLogo } from "../../../icons";
import { EditableText } from "../../properties-panel/ui";
import { RunButton } from "./run-button";

export function V2Header() {
	const { updateName, data } = useWorkflowDesigner();
	const handleChange = useCallback(
		(value?: string) => {
			if (!value) {
				return;
			}
			updateName(value);
		},
		[updateName],
	);

	return (
		<header className="bg-surface-background border-b border-border px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link href="/">
						<GiselleLogo className="fill-text w-[70px] h-auto" />
					</Link>
					<EditableText
						fallbackValue="Untitled"
						onChange={handleChange}
						value={data.name}
						size="large"
					/>
				</div>
				<div className="flex items-center space-x-4">
					<RunButton />
				</div>
			</div>
		</header>
	);
}
