"use client";

import type { NodeLike } from "@giselle-sdk/data-type";
import { defaultName } from "@giselle-sdk/giselle/react";
import type { ReactNode } from "react";
import { EditableText } from "../../../ui/editable-text";
import {
	getContentClasses,
	getHeaderClasses,
	PANEL_SPACING,
} from "./panel-spacing";

export function PropertiesPanelRoot({ children }: { children: ReactNode }) {
	return (
		<div
			className={`${PANEL_SPACING.LAYOUT.FULL_HEIGHT} ${PANEL_SPACING.LAYOUT.FULL_WIDTH} ${PANEL_SPACING.LAYOUT.FLEX_COL} ${PANEL_SPACING.CONTENT.GAP} ${PANEL_SPACING.LAYOUT.OVERFLOW_HIDDEN}`}
		>
			{children}
		</div>
	);
}

export function PropertiesPanelHeader({
	node,
	description,
	icon,
	onChangeName,
	action,
}: {
	node: NodeLike;
	description?: string;
	icon: ReactNode;
	onChangeName?: (name?: string) => void;
	action?: ReactNode;
}) {
	return (
		<div className={getHeaderClasses()}>
			<div className={`flex ${PANEL_SPACING.HEADER.ICON_GAP} items-center`}>
				<div
					className="bg-bg-900 rounded-[4px] flex items-center justify-center"
					style={{
						width: PANEL_SPACING.HEADER.ICON_SIZE,
						height: PANEL_SPACING.HEADER.ICON_SIZE,
					}}
				>
					{icon}
				</div>
				<div>
					<div>
						<EditableText
							onValueChange={(value) => {
								if (value === defaultName(node)) {
									return;
								}
								if (value.trim().length === 0) {
									onChangeName?.();
									return;
								}
								onChangeName?.(value);
							}}
							text={defaultName(node)}
						/>
					</div>
					{description && (
						<p className="px-[5px] text-white-400 text-[10px]">{description}</p>
					)}
				</div>
			</div>
			{action}
		</div>
	);
}

export function PropertiesPanelContent({ children }: { children: ReactNode }) {
	return <div className={getContentClasses()}>{children}</div>;
}
