"use client";

import { useMemo } from "react";
import { DataSourceTable } from "../../../data-source";
import { RunHistoryTable } from "../../../run-history/run-history-table";
import { SecretTable } from "../../../secret/secret-table";
import { panelConfigs } from "../../../shared/panel-config";
import type { LeftPanelValue } from "../../state";
import { PanelContent } from "./panel-content";
import { ResizablePanel } from "./resizable-panel";

interface PanelWrapperProps {
	isOpen: boolean;
	panelType: LeftPanelValue | null;
	onClose: () => void;
	onWidthChange?: (width: number) => void;
}

const componentMap = {
	"run-history": RunHistoryTable,
	secret: SecretTable,
	"data-source": DataSourceTable,
} as const;

export function PanelWrapper({
	isOpen,
	panelType,
	onClose,
	onWidthChange,
}: PanelWrapperProps) {
	const panelData = useMemo(() => {
		if (!panelType || !isOpen) return null;

		const Component = componentMap[panelType];
		if (!Component) return null;

		const config = panelConfigs[panelType];
		return {
			Component,
			config,
		};
	}, [panelType, isOpen]);

	if (!panelData) return null;

	const { Component, config } = panelData;

	return (
		<PanelContent showHeader={true} title={config.title} onClose={onClose}>
			<Component />
		</PanelContent>
	);
}
