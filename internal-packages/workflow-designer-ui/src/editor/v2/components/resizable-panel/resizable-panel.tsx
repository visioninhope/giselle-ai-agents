"use client";

import clsx from "clsx/lite";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface ResizablePanelProps {
  children: ReactNode;
  isOpen: boolean;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  className?: string;
  onWidthChange?: (width: number) => void;
}

export function ResizablePanel({
  children,
  isOpen,
  minWidth,
  maxWidth,
  defaultWidth,
  className,
  onWidthChange,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Update width when panel opens/closes
  useEffect(() => {
    if (isOpen && width < minWidth) {
      setWidth(defaultWidth);
    }
  }, [isOpen, width, minWidth, defaultWidth]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = width;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, startWidth + deltaX),
        );
        setWidth(newWidth);
        onWidthChange?.(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [width, minWidth, maxWidth, onWidthChange],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={clsx(
        "relative h-full bg-black-900 border-r border-black-600 flex-shrink-0",
        "transition-all duration-200 ease-out",
        isResizing && "select-none",
        className,
      )}
      style={{ width: `${width}px` }}
    >
      {/* Panel content */}
      <div className="h-full overflow-hidden">{children}</div>

      {/* Resize handle */}
      <div
        className={clsx(
          "absolute top-0 right-0 w-1 h-full cursor-col-resize",
          "hover:bg-blue-500/50 active:bg-blue-500/70",
          "transition-colors duration-150",
          "group",
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator */}
        <div
          className={clsx(
            "absolute top-1/2 right-0 w-1 h-8 -translate-y-1/2",
            "bg-black-400 group-hover:bg-blue-500 group-active:bg-blue-600",
            "transition-colors duration-150 rounded-l",
          )}
        />
      </div>
    </div>
  );
}
