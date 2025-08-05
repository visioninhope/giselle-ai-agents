"use client";

import clsx from "clsx/lite";
import Link from "next/link";
import { GiselleIcon } from "@giselle-internal/workflow-designer-ui";

export function StageHeader() {
  return (
    <div
      className={clsx(
        "relative h-[48px] flex items-center justify-between",
        "pl-[8px] pr-[8px] gap-[8px]",
        "border-b border-white/10",
        "shrink-0",
      )}
    >
      {/* Left section: Logo + Stage */}
      <div className="flex items-center gap-[3px] min-w-0">
        <Link
          href="/"
          className="flex items-center gap-[3px] group"
          aria-label="Go to home"
        >
          <GiselleIcon className="text-white-900 w-[24px] h-[24px] group-hover:text-primary-100 transition-colors" />
          <span className="text-white-900 text-[13px] font-semibold group-hover:text-primary-100 transition-colors">
            Studio
          </span>
        </Link>
        <span className="text-white-900/20 text-[18px] font-[250] leading-none ml-[4px]">
          /
        </span>

        {/* Stage section */}
        <div className="flex items-center gap-[3px] min-w-0 ml-[6px]">
          <span className="text-[#6B8FF0] text-[13px] font-medium">Stage</span>
        </div>
      </div>

      {/* Right section: Empty for now, can add stage-specific actions later */}
      <div className="flex items-center gap-[8px]">
        {/* Future: Add stage-specific actions here */}
      </div>
    </div>
  );
}
