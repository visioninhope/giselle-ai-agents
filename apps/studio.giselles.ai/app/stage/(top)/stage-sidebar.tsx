"use client";

import clsx from "clsx/lite";
import {
  Home,
  Plus,
  Library,
  Search,
  Radio,
  Compass,
  Bell,
  Gift,
  Sparkles,
  MoreHorizontal,
  Book,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { GiselleIcon, WilliIcon } from "@giselle-internal/workflow-designer-ui";
import { Tooltip } from "@giselle-internal/workflow-designer-ui";
import { AvatarImage } from "@/services/accounts/components/user-button/avatar-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StageSidebarProps {
  user?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  };
}

export function StageSidebar({ user }: StageSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems = [
    { icon: Sparkles, label: "Generation", href: "/stage", active: true },
    { icon: Library, label: "Showcase", href: "/showcase", active: false },
    { icon: WilliIcon, label: "Acts", href: "/acts", active: false },
  ];

  const bottomItems = [
    {
      icon: Book,
      label: "Docs",
      href: "https://docs.giselles.ai/guides/introduction",
    },
    { icon: Home, label: "Lobby", href: "/apps" },
  ];

  return (
    <div
      className={clsx(
        "h-screen bg-black-950 flex flex-col border-r border-white/10 transition-all duration-300",
        isCollapsed ? "w-[48px]" : "w-[200px]",
      )}
    >
      {/* Header Section */}
      <div
        className={clsx(
          "py-2 border-b border-white/10",
          isCollapsed ? "px-2" : "px-4",
        )}
      >
        <div className="mb-4">
          {isCollapsed ? (
            <div className="flex items-center justify-center gap-1">
              <GiselleIcon className="text-white-900 w-[24px] h-[24px] flex-shrink-0" />
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-white-700 hover:text-white-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 transition-transform duration-300 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[3px]">
                <GiselleIcon className="text-white-900 w-[24px] h-[24px]" />
                <span className="text-white-900 text-[13px] font-semibold">
                  Stage
                </span>
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-white-700 hover:text-white-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="cursor-pointer w-full"
              aria-label="Profile menu"
            >
              <div
                className={clsx(
                  "flex items-center",
                  isCollapsed ? "justify-center" : "gap-3",
                )}
              >
                {isCollapsed ? (
                  <Tooltip
                    text={user.displayName || user.email || "User"}
                    side="right"
                    variant="light"
                  >
                    <AvatarImage
                      className="w-8 h-8 rounded-full"
                      avatarUrl={user.avatarUrl}
                      width={32}
                      height={32}
                      alt={user.displayName || user.email || "User"}
                    />
                  </Tooltip>
                ) : (
                  <AvatarImage
                    className="w-8 h-8 rounded-full"
                    avatarUrl={user.avatarUrl}
                    width={32}
                    height={32}
                    alt={user.displayName || user.email || "User"}
                  />
                )}
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-bold text-sm text-white-400 truncate block">
                        {user.displayName || "No display name"}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-black-600 hover:text-white-700 transition-colors" />
                  </>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="p-2 border-[0.5px] border-white/10 rounded-xl shadow-[0_2px_8px_rgba(5,10,20,0.4),0_1px_2px_rgba(0,0,0,0.3)] bg-black-900/50 backdrop-blur-md"
            >
              <DropdownMenuLabel className="flex flex-col px-2 pt-2 pb-1 text-white-400">
                <span className="font-bold text-[16px] leading-[16px] font-geist">
                  {user.displayName || "No display name"}
                </span>
                <span className="font-medium leading-[20.4px] font-geist text-black-600">
                  {user.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="py-1 space-y-1">
                <DropdownMenuItem
                  className="p-0 rounded-lg focus:bg-white/5"
                  asChild
                >
                  <Link
                    href="/settings/account"
                    className="block px-2 py-1.5 w-full text-white-400 font-medium text-[14px] leading-[14px] font-geist"
                    aria-label="Account settings"
                  >
                    Account Settings
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="py-1 space-y-1">
                <DropdownMenuItem className="p-0 rounded-lg focus:bg-white/5">
                  <a
                    href="https://giselles.ai/"
                    target="_blank"
                    className="block px-2 py-1.5 w-full text-white-400 font-medium text-[14px] leading-[14px] font-geist"
                    rel="noreferrer"
                  >
                    Home Page
                  </a>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4">
        <nav>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex items-center text-sm transition-colors",
                  isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                  item.active
                    ? "text-[color:var(--color-text-nav-active)]"
                    : "text-[color:var(--color-text-nav-inactive)] hover:text-[color:var(--color-text-nav-active)]",
                )}
              >
                {isCollapsed ? (
                  <Tooltip text={item.label} side="right" variant="light">
                    <IconComponent className="w-5 h-5" />
                  </Tooltip>
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="py-4">
        {bottomItems.map((item) => {
          const IconComponent = item.icon;
          const isExternalLink = item.href.startsWith("http");

          if (isExternalLink) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "flex items-center text-sm text-white-700 hover:text-white-900 hover:bg-white/5 transition-colors",
                  isCollapsed
                    ? "justify-center px-2 py-3"
                    : "justify-between px-4 py-3",
                )}
              >
                <div
                  className={clsx(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "gap-3",
                  )}
                >
                  {isCollapsed ? (
                    <Tooltip text={item.label} side="right" variant="light">
                      <IconComponent className="w-5 h-5" />
                    </Tooltip>
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="bg-white/20 text-white-900 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center text-sm text-white-700 hover:text-white-900 hover:bg-white/5 transition-colors",
                isCollapsed
                  ? "justify-center px-2 py-3"
                  : "justify-between px-4 py-3",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <div
                className={clsx(
                  "flex items-center",
                  isCollapsed ? "justify-center" : "gap-3",
                )}
              >
                {isCollapsed ? (
                  <Tooltip text={item.label} side="right" variant="light">
                    <IconComponent className="w-5 h-5" />
                  </Tooltip>
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="bg-white/20 text-white-900 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
