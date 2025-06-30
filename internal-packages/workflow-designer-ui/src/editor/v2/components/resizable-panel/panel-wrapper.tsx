"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { DataSourceTable } from "../../../data-source";
import { RunHistoryTable } from "../../../run-history/run-history-table";
import { SecretTable } from "../../../secret/secret-table";
import type { LeftPanelValue } from "../../state";
import { PanelContent } from "./panel-content";
import { ResizablePanel } from "./resizable-panel";

interface PanelWrapperProps {
  isOpen: boolean;
  panelType: LeftPanelValue | null;
  onClose: () => void;
  onWidthChange?: (width: number) => void;
}

const panelConfig = {
  "run-history": {
    title: "Run History",
    component: RunHistoryTable,
    minWidth: 500,
    defaultWidth: 650,
    maxWidth: 1000,
  },
  secret: {
    title: "Secrets",
    component: SecretTable,
    minWidth: 300,
    defaultWidth: 400,
    maxWidth: 600,
  },
  "data-source": {
    title: "Data Source",
    component: DataSourceTable,
    minWidth: 350,
    defaultWidth: 450,
    maxWidth: 700,
  },
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

    const config = panelConfig[panelType];
    if (!config) {
      console.warn(`Unknown panel type: ${panelType}`);
      return {
        content: null,
        title: "",
        minWidth: 300,
        defaultWidth: 400,
        maxWidth: 600,
      };
    }

    const Component = config.component;
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
      <PanelContent showHeader={false}>
        <div className="relative h-full">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded hover:bg-black-700 text-white-900 hover:text-white-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {content}
        </div>
      </PanelContent>
    </ResizablePanel>
  );
}
