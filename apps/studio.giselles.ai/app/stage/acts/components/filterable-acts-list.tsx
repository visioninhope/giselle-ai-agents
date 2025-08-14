"use client";

import { Button } from "@giselle-internal/ui/button";
import { PopoverContent } from "@giselle-internal/ui/popover";
import { StatusBadge } from "@giselle-internal/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@giselle-internal/ui/table";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import clsx from "clsx/lite";
import { CheckIcon, ChevronDownIcon, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// GitHub-style search parser
interface SearchFilters {
  isOpen?: boolean;
  isArchived?: boolean;
  freeText: string;
}

function parseSearchQuery(query: string): SearchFilters {
  const filters: SearchFilters = { freeText: "" };
  const parts = query.split(/\s+/);
  const freeTextParts: string[] = [];

  for (const part of parts) {
    if (part === "is:open") {
      filters.isOpen = true;
    } else if (part === "is:archived") {
      filters.isArchived = true;
    } else if (part.trim()) {
      freeTextParts.push(part);
    }
  }

  filters.freeText = freeTextParts.join(" ");
  return filters;
}

function matchesSearchFilters(
  act: ActWithNavigation,
  filters: SearchFilters,
): boolean {
  // Check status filters
  // is:open means non-archived (currently shows all since no archived status exists)
  if (filters.isOpen && act.status === "archived") return false;
  if (filters.isArchived) return false; // No archived status yet, so always false

  // Check free text search
  if (filters.freeText) {
    const searchText = filters.freeText.toLowerCase();
    const matchesText =
      act.workspaceName.toLowerCase().includes(searchText) ||
      act.teamName.toLowerCase().includes(searchText);
    if (!matchesText) return false;
  }

  return true;
}

type ActWithNavigation = {
  id: string;
  status: "inProgress" | "completed" | "failed" | "cancelled";
  createdAt: string;
  workspaceName: string;
  teamName: string;
  link: string;
};

type StatusFilter = "inProgress" | "completed" | "failed" | "cancelled";

interface FilterableActsListProps {
  acts: ActWithNavigation[];
  onReload?: () => void;
}

const statusLabels: Record<StatusFilter, string> = {
  inProgress: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusColors: Record<StatusFilter, string> = {
  inProgress: "bg-blue-400",
  completed: "bg-green-400",
  failed: "bg-red-400",
  cancelled: "bg-gray-400",
};

export function FilterableActsList({
  acts,
  onReload,
}: FilterableActsListProps) {
  const [searchQuery, setSearchQuery] = useState("is:open");
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>(
    Object.keys(statusLabels) as StatusFilter[],
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const _statusCounts = useMemo(() => {
    const counts = acts.reduce(
      (acc, act) => {
        acc[act.status] = (acc[act.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      inProgress: counts.inProgress || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      cancelled: counts.cancelled || 0,
    };
  }, [acts]);

  const filteredActs = useMemo(() => {
    const searchFilters = parseSearchQuery(searchQuery);

    return acts.filter((act) => {
      // First check status dropdown filter
      const matchesStatusDropdown = selectedStatuses.includes(act.status);

      // Then check GitHub-style search filters
      const matchesSearch = matchesSearchFilters(act, searchFilters);

      return matchesStatusDropdown && matchesSearch;
    });
  }, [acts, searchQuery, selectedStatuses]);

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  // Add custom styles for select components to match /stage page
  useEffect(() => {
    const styleId = "acts-select-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.textContent = `
	        .status-select button[type="button"] {
	          background-color: rgba(255, 255, 255, 0.05) !important;
	          border: none !important;
	          color: white !important;
	          font-size: 14px !important;
	          font-family: inherit !important;
	        }
	        .status-select button[type="button"]:hover {
	          background-color: rgba(255, 255, 255, 0.1) !important;
	        }
	        .status-select button[type="button"] svg {
	          margin-left: 8px !important;
	        }
	        .status-select [role="option"] {
	          font-size: 14px !important;
	        }
	        .search-input input {
	          background-color: rgba(255, 255, 255, 0.05) !important;
	        }
	        .search-input input:hover {
	          background-color: rgba(255, 255, 255, 0.1) !important;
	        }
	      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div className="flex-1 px-[24px] bg-[var(--color-stage-background)] pt-16 md:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 h-full flex flex-col">
      <div className="py-6 h-full flex flex-col">
        <div className="flex items-center justify-between px-1 mb-6">
          <div>
            <h1
              className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)] mb-2"
              style={{
                textShadow:
                  "0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
              }}
            >
              Tasks
            </h1>
            <p className="text-sm text-white-700">
              View and manage all your running and completed tasks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReload}
              className="px-3 py-1 text-sm text-white-700 hover:text-white-900 hover:bg-white/5 rounded transition-colors"
            >
              Reload
            </button>
            <Button type="button" variant="subtle">
              Archive
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="search-input relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search tasks... (try: is:open, workspace name)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-1 border-none rounded-[8px] h-10 text-white-900 placeholder-white-600 focus:outline-none transition-colors text-[14px]"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white-600" />
          </div>

          {/* Status Filter */}
          <div className="status-select">
            <PopoverPrimitive.Root
              open={showStatusDropdown}
              onOpenChange={setShowStatusDropdown}
            >
              <PopoverPrimitive.Trigger asChild>
                <button
                  type="button"
                  className={clsx(
                    "flex items-center gap-2 rounded-[8px] h-10 px-[12px] text-left text-[14px]",
                    "outline-none focus:outline-none",
                    "transition-colors",
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-text">
                      Status {selectedStatuses.length}/
                      {Object.keys(statusLabels).length}
                    </span>
                    <div className="flex -space-x-1">
                      {selectedStatuses.map((status) => (
                        <div
                          key={status}
                          className={`w-3 h-3 rounded-full border border-black-900 ${statusColors[status]}`}
                        />
                      ))}
                    </div>
                  </div>
                  <ChevronDownIcon className="size-[13px] shrink-0 text-text" />
                </button>
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-50"
                >
                  <PopoverContent>
                    {Object.entries(statusLabels).map(([status, label]) => {
                      const isSelected = selectedStatuses.includes(
                        status as StatusFilter,
                      );
                      return (
                        <button
                          type="button"
                          key={status}
                          onClick={() => {
                            const statusKey = status as StatusFilter;
                            setSelectedStatuses((prev) =>
                              isSelected
                                ? prev.filter((s) => s !== statusKey)
                                : [...prev, statusKey],
                            );
                          }}
                          className={clsx(
                            "w-full text-text outline-none cursor-pointer hover:bg-ghost-element-hover",
                            "rounded-[4px] px-[8px] py-[6px] text-[14px]",
                            "flex items-center justify-between gap-[4px]",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${statusColors[status as StatusFilter]}`}
                            />
                            <span>{label}</span>
                          </div>
                          <CheckIcon
                            className={clsx(
                              "size-[13px]",
                              isSelected ? "text-text" : "text-transparent",
                            )}
                          />
                        </button>
                      );
                    })}
                  </PopoverContent>
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredActs.length === 0 && acts.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-white-100 mb-2">
                No tasks match your filters
              </h2>
              <p className="text-sm text-white-700 mb-6 max-w-sm">
                Try adjusting your search or filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatuses(
                    Object.keys(statusLabels) as StatusFilter[],
                  );
                }}
                className="px-4 py-2 bg-white/10 text-white-900 rounded-lg hover:bg-white/20 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : filteredActs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-gray-400">📝</span>
              </div>
              <h2 className="text-lg font-medium text-white-100 mb-2">
                No tasks yet
              </h2>
              <p className="text-sm text-white-700 mb-6 max-w-sm">
                Start by creating your first task from the main stage page.
              </p>
              <Link href="/stage">
                <Button variant="solid">Create New Task</Button>
              </Link>
            </div>
          ) : (
            <Table className="table-fixed w-full">
              <TableBody>
                {filteredActs.map((act) => {
                  return (
                    <TableRow
                      key={act.id}
                      className="hover:bg-white/5 transition-colors duration-200"
                    >
                      <TableCell className="w-12 !p-0 !m-0">
                        <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center">
                          <span className="text-sm text-gray-400">App</span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[240px]">
                        <div className="flex flex-col">
                          <span className="truncate font-medium text-white-100">
                            {act.workspaceName}
                          </span>
                          <span className="text-sm text-black-600 truncate">
                            {new Date(act.createdAt)
                              .toISOString()
                              .slice(0, 19)
                              .replace("T", " ")}{" "}
                            · {act.teamName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center w-32">
                        {act.status === "inProgress" && (
                          <StatusBadge status="info" variant="dot">
                            Running
                          </StatusBadge>
                        )}
                        {act.status === "completed" && (
                          <StatusBadge status="success" variant="dot">
                            Completed
                          </StatusBadge>
                        )}
                        {act.status === "failed" && (
                          <StatusBadge status="error" variant="dot">
                            Failed
                          </StatusBadge>
                        )}
                        {act.status === "cancelled" && (
                          <StatusBadge status="ignored" variant="dot">
                            Cancelled
                          </StatusBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-right w-20">
                        <div className="flex justify-end">
                          <Link
                            href={act.link}
                            className="text-white-700 hover:text-white-900 text-sm transition-colors"
                          >
                            More {">"}
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
