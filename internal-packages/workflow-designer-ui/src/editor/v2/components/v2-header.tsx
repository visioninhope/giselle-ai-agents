"use client";

import { useWorkflowDesigner } from "giselle-sdk/react";
import Link from "next/link";
import { useCallback } from "react";
import { GiselleLogo } from "../../../icons";
import { EditableText } from "../../properties-panel/ui";

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
					<button
						type="button"
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Run
					</button>
				</div>
			</div>
		</header>
	);
}
