"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { DataSourceTable } from "../../../data-source";
import { RunHistoryTable } from "../../../run-history/run-history-table";
import { SecretTable } from "../../../secret/secret-table";
import { getPanelConfig } from "../../../shared/panel-config";
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
  const { content, title, minWidth, defaultWidth, maxWidth } = useMemo(() => {
    if (!panelType || !isOpen) {
      return {
        content: null,
        title: "",
        minWidth: 300,
        defaultWidth: 400,
        maxWidth: 600,
      };
    }

    const Component = componentMap[panelType];
    if (!Component) {
      console.warn(`Unknown panel type: ${panelType}`);
      return {
        content: null,
        title: "",
        minWidth: 300,
        defaultWidth: 400,
        maxWidth: 600,
      };
    }

    const config = getPanelConfig(panelType);
    return {
      content: <Component />,
      title: config.title,
      minWidth: config.minWidth,
      defaultWidth: config.defaultWidth,
      maxWidth: config.maxWidth,
    };
  }, [panelType, isOpen]);

  if (!panelType || !content) {
    return null;
  }

  return (
    <ResizablePanel
      isOpen={isOpen}
      minWidth={minWidth}
      defaultWidth={defaultWidth}
      maxWidth={maxWidth}
      onWidthChange={onWidthChange}
    >
      <PanelContent showHeader={true} title={title} onClose={onClose}>
        {content}
      </PanelContent>
    </ResizablePanel>
  );
}
