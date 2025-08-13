"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect } from "react";

// Simple ResizeHandle component
function ResizeHandle({
  direction = "horizontal",
}: {
  direction?: "horizontal" | "vertical";
}) {
  const isVertical = direction === "vertical";

  return (
    <div className="transition-colors duration-200 flex items-center justify-center group">
      <div
        className={`rounded-full bg-black-70/50 group-hover:bg-[#4a90e2] ${
          isVertical ? "h-[3px] w-[32px]" : "w-[3px] h-[32px]"
        }`}
      />
    </div>
  );
}

interface ResizableLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function ResizableLayout({
  leftPanel,
  rightPanel,
}: ResizableLayoutProps) {
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsVertical(window.innerWidth < 600);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isVertical) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 py-6">{leftPanel}</div>
        <div className="h-[1px] bg-black-70/50"></div>
        <div className="flex-1 space-y-4 py-6">{rightPanel}</div>
      </div>
    );
  }

  return (
    <PanelGroup direction="horizontal" className="min-h-screen">
      <Panel
        defaultSize={70}
        minSize={60}
        maxSize={80}
        className="space-y-6 py-6 pr-6"
      >
        {leftPanel}
      </Panel>
      <PanelResizeHandle className="w-[3px] cursor-col-resize bg-black-70/50 hover:bg-[#4a90e2] transition-colors duration-200"></PanelResizeHandle>
      <Panel
        defaultSize={30}
        minSize={20}
        maxSize={40}
        className="space-y-2 py-6 pl-6"
      >
        {rightPanel}
      </Panel>
    </PanelGroup>
  );
}
