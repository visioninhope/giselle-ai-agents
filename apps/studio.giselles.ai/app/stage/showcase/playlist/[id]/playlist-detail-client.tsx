"use client";

import { Edit3, Play, Plus, Trash2, MoreHorizontal } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";

interface App {
  id: string;
  name: string;
  workspaceId: string;
  updatedAt: Date;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  apps: App[];
}

interface PlaylistDetailClientProps {
  playlist: Playlist;
}

export function PlaylistDetailClient({ playlist }: PlaylistDetailClientProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/stage/showcase?tab=Playlist");
  };

  const handleEditPlaylist = () => {
    // TODO: Implement edit functionality
    console.log("Edit playlist:", playlist.id);
  };

  const handleDeletePlaylist = () => {
    // TODO: Implement delete functionality
    console.log("Delete playlist:", playlist.id);
  };

  const handleAddApps = () => {
    // TODO: Implement add apps functionality
    console.log("Add apps to playlist:", playlist.id);
  };

  const handleAppClick = (app: App) => {
    router.push(`/stage/app-detail/${app.workspaceId}`);
  };

  const handleAppKeyDown = (event: React.KeyboardEvent, app: App) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAppClick(app);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex-1 px-[24px] bg-[var(--color-stage-background)] pt-16 md:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 h-full flex flex-col">
      <div className="py-6 h-full flex flex-col">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center text-sm text-[hsl(192,25%,65%)]">
            <button
              onClick={() => router.push("/stage/showcase")}
              className="hover:text-white transition-colors"
            >
              Showcase
            </button>
            <span className="mx-2">›</span>
            <button
              onClick={() => router.push("/stage/showcase?tab=Playlist")}
              className="hover:text-white transition-colors"
            >
              Playlist
            </button>
            <span className="mx-2">›</span>
            <span className="text-white font-medium">{playlist.title}</span>
          </nav>
        </div>

        {/* Spotify-like Header */}
        <div className="flex items-end gap-6 mb-8">
          {/* Playlist Thumbnail */}
          <div className="w-[232px] h-[232px] rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex-shrink-0 shadow-2xl">
            <div className="w-full h-full rounded-lg bg-black/20" />
          </div>

          {/* Playlist Info */}
          <div className="flex-1 pb-4">
            <h1 className="text-[48px] font-black text-white mb-4 leading-none">
              {playlist.title}
            </h1>
            <p className="text-[hsl(192,25%,65%)] text-base mb-4 max-w-2xl">
              {playlist.description}
            </p>
            <div className="flex items-center justify-between text-sm text-[hsl(192,25%,65%)]">
              <div className="flex items-center gap-1">
                <span className="text-white font-medium">Created by you</span>
                <span>•</span>
                <span>
                  {playlist.apps.length}{" "}
                  {playlist.apps.length === 1 ? "app" : "apps"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAddApps}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-md transition-all duration-200"
                >
                  <Plus size={16} />
                  Add Apps
                </Button>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="link"
                      className="w-8 h-8 p-0 text-[hsl(192,25%,65%)] hover:text-white transition-colors"
                    >
                      <MoreHorizontal size={24} />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="bg-[#282828] border border-white/10 rounded-md p-1 shadow-lg min-w-[180px]"
                      sideOffset={5}
                    >
                      <DropdownMenu.Item
                        className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-sm cursor-pointer"
                        onClick={handleEditPlaylist}
                      >
                        <Edit3 size={16} />
                        Edit details
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-sm cursor-pointer"
                        onClick={handleDeletePlaylist}
                      >
                        <Trash2 size={16} />
                        Delete playlist
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          </div>
        </div>

        {/* Apps grid */}
        <div className="flex-1 overflow-auto">
          {playlist.apps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlist.apps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleAppClick(app)}
                  onKeyDown={(e) => handleAppKeyDown(e, app)}
                  className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-[hsl(192,73%,84%)] font-medium text-lg mb-2 group-hover:text-white transition-colors">
                        {app.name || "Untitled"}
                      </h3>
                      <p className="text-[hsl(192,25%,65%)] text-sm">
                        Updated {formatDate(app.updatedAt)}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(192,73%,84%)]">
                      <Play size={16} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(192,25%,65%)] text-xs font-mono">
                      {app.workspaceId}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-[hsl(192,73%,84%)] text-lg font-medium mb-2">
                No apps in this playlist
              </h3>
              <p className="text-[hsl(192,25%,65%)] text-sm mb-4">
                Add some apps to get started
              </p>
              <Button
                onClick={handleAddApps}
                className="bg-[hsl(192,73%,84%)] text-black hover:bg-[hsl(192,73%,88%)]"
              >
                <Plus size={16} className="mr-2" />
                Add Apps
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
