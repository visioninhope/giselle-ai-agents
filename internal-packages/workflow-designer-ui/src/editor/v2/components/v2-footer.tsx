"use client";

import { DatabaseIcon, FileKey2Icon, HistoryIcon } from "lucide-react";
import type { LeftPanelValue } from "../state";

interface V2FooterProps {
  onLeftPaelValueChange: (leftMenu: LeftPanelValue) => void;
}

export function V2Footer({ onLeftPaelValueChange }: V2FooterProps) {
  return (
    <footer className="h-[30px] border-t border-black-600 px-6 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onLeftPaelValueChange("run-history")}
            className="text-white-900 hover:text-[#6B8FF0] cursor-pointer"
            title="Run History"
          >
            <HistoryIcon className="w-[14px] h-[14px]" />
          </button>
          <button
            type="button"
            onClick={() => onLeftPaelValueChange("secret")}
            className="text-white-900 hover:text-[#6B8FF0] cursor-pointer"
            title="Secrets"
          >
            <FileKey2Icon className="w-[14px] h-[14px]" />
          </button>
          <button
            type="button"
            onClick={() => onLeftPaelValueChange("data-source")}
            className="text-white-900 hover:text-[#6B8FF0] cursor-pointer"
            title="Data Source"
          >
            <DatabaseIcon className="w-[14px] h-[14px]" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-white-900">
            Nodes: 0 | Connections: 0
          </span>
          <button
            type="button"
            className="text-sm text-white-900 hover:text-[#6B8FF0]"
          >
            Help
          </button>
        </div>
      </div>
    </footer>
  );
}
