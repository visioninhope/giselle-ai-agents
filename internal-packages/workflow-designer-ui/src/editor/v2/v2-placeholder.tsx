"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { Tabs } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import "@xyflow/react/dist/style.css";
import clsx from "clsx/lite";
import { Background } from "../../ui/background";
import { ReadOnlyBanner } from "../../ui/read-only-banner";
import { ToastProvider } from "../../ui/toast";
import { DataSourceTable } from "../data-source";
import { PropertiesPanel } from "../properties-panel";
import { RunHistoryTable } from "../run-history/run-history-table";
import { SecretTable } from "../secret/secret-table";
import { SideMenu } from "../side-menu";
import {
  MousePositionProvider,
  Toolbar,
  ToolbarContextProvider,
} from "../tool";

function V2NodeCanvas() {
  return (
    <div className="h-full bg-surface-background relative">
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-black-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-black-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Workflow canvas"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text mb-2">
            Workflow Designer V2
          </h3>
          <p className="text-text-subtle">
            Enhanced layout with improved performance and user experience.
          </p>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Toolbar />
      </div>
    </div>
  );
}

export function V2Placeholder({
  isReadOnly = false,
  userRole = "viewer",
}: {
  isReadOnly?: boolean;
  userRole?: "viewer" | "guest" | "editor" | "owner";
}) {
  const { data } = useWorkflowDesigner();
  const selectedNodes = useMemo(
    () =>
      Object.entries(data.ui.nodeState)
        .filter(([_, nodeState]) => nodeState?.selected)
        .map(([nodeId]) => data.nodes.find((node) => node.id === nodeId))
        .filter((node) => node !== undefined),
    [data],
  );

  const [showReadOnlyBanner, setShowReadOnlyBanner] = useState(isReadOnly);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const handleDismissBanner = useCallback(() => {
    setShowReadOnlyBanner(false);
  }, []);

  useEffect(() => {
    const rightPanel = rightPanelRef.current;
    if (!rightPanel) return;

    if (selectedNodes.length === 1) {
      rightPanel.resize(30);
    } else {
      rightPanel.resize(0);
    }
  }, [selectedNodes]);

  return (
    <div className="flex-1 overflow-hidden font-sans pl-[16px]">
      {showReadOnlyBanner && isReadOnly && (
        <ReadOnlyBanner
          onDismiss={handleDismissBanner}
          userRole={userRole}
          className="z-50"
        />
      )}

      <ToastProvider>
        <ReactFlowProvider>
          <ToolbarContextProvider>
            <MousePositionProvider>
              <Tabs.Root defaultValue="builder" asChild>
                <PanelGroup
                  direction="horizontal"
                  className="bg-black-900 h-full flex pr-[16px] py-[16px]"
                >
                  <Panel defaultSize={10}>
                    <SideMenu />
                  </Panel>

                  <PanelResizeHandle
                    className={clsx(
                      "group pt-[16px] pb-[32px] h-full pl-[3px]",
                    )}
                  >
                    <div className="w-[2px] h-full bg-transparent group-data-[resize-handle-state=hover]:bg-black-400 group-data-[resize-handle-state=drag]:bg-black-400 transition-colors" />
                  </PanelResizeHandle>

                  <Panel className="flex-1 border border-border rounded-[12px]">
                    <Tabs.Content value="builder" className="h-full">
                      <PanelGroup direction="horizontal">
                        <Panel>
                          <V2NodeCanvas />
                        </Panel>
                        <PanelResizeHandle
                          className={clsx(
                            "w-[1px] bg-border cursor-col-resize",
                            "data-[resize-handle-state=hover]:bg-[#4a90e2]",
                            "opacity-0 data-[right-panel=show]:opacity-100 transition-opacity",
                          )}
                          data-right-panel={
                            selectedNodes.length === 1 ? "show" : "hide"
                          }
                        />
                        <Panel
                          id="right-panel"
                          className="flex bg-surface-background"
                          ref={rightPanelRef}
                          defaultSize={0}
                          data-right-panel={
                            selectedNodes.length === 1 ? "show" : "hide"
                          }
                        >
                          {selectedNodes.length === 1 && (
                            <div className="flex-1 overflow-hidden">
                              <PropertiesPanel />
                            </div>
                          )}
                        </Panel>
                      </PanelGroup>
                    </Tabs.Content>

                    <Tabs.Content
                      value="secret"
                      className="h-full outline-none"
                    >
                      <SecretTable />
                    </Tabs.Content>

                    <Tabs.Content
                      value="data-source"
                      className="h-full outline-none"
                    >
                      <DataSourceTable />
                    </Tabs.Content>

                    <Tabs.Content
                      value="run-history"
                      className="h-full outline-none"
                    >
                      <RunHistoryTable />
                    </Tabs.Content>
                  </Panel>
                </PanelGroup>
              </Tabs.Root>
            </MousePositionProvider>
          </ToolbarContextProvider>
        </ReactFlowProvider>
      </ToastProvider>
    </div>
  );
}
