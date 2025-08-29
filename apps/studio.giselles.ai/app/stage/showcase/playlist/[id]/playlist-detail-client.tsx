"use client";

import {
  ArrowLeft,
  Edit3,
  Play,
  Plus,
  Search,
  Trash2,
  MoreHorizontal,
  Shuffle,
  Heart,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = useMemo(() => {
    if (!searchQuery) return playlist.apps;
    const query = searchQuery.toLowerCase();
    return playlist.apps.filter((app) => {
      const appName = (app.name || "Untitled").toLowerCase();
      return appName.includes(query);
    });
  }, [searchQuery, playlist.apps]);

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
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="link"
            onClick={handleBackClick}
            className="p-2 hover:bg-white/10 text-[hsl(192,73%,84%)] -ml-2"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>

        {/* Spotify-like Header */}
        <div className="flex items-end gap-6 mb-8">
          {/* Playlist Thumbnail */}
          <div className="w-[232px] h-[232px] rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex-shrink-0 shadow-2xl">
            <div className="w-full h-full rounded-lg bg-black/20" />
          </div>

          {/* Playlist Info */}
          <div className="flex-1 pb-4">
            <p className="text-[hsl(192,25%,65%)] text-sm font-medium mb-2">
              Playlist
            </p>
            <h1 className="text-[48px] font-black text-white mb-4 leading-none">
              {playlist.title}
            </h1>
            <p className="text-[hsl(192,25%,65%)] text-base mb-4 max-w-2xl">
              {playlist.description}
            </p>
            <div className="flex items-center gap-1 text-sm text-[hsl(192,25%,65%)]">
              <span className="text-white font-medium">Created by you</span>
              <span>•</span>
              <span>
                {playlist.apps.length}{" "}
                {playlist.apps.length === 1 ? "app" : "apps"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-6 mb-6">
          <Button
            onClick={handleAddApps}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black hover:scale-105 transition-all duration-200"
          >
            <Play size={20} fill="currentColor" />
          </Button>

          <Button
            variant="link"
            className="w-8 h-8 p-0 text-[hsl(192,25%,65%)] hover:text-white transition-colors"
          >
            <Heart size={32} />
          </Button>

          <Button
            onClick={handleAddApps}
            variant="link"
            className="w-8 h-8 p-0 text-[hsl(192,25%,65%)] hover:text-white transition-colors"
          >
            <Plus size={32} />
          </Button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="link"
                className="w-8 h-8 p-0 text-[hsl(192,25%,65%)] hover:text-white transition-colors"
              >
                <MoreHorizontal size={32} />
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

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(192,25%,65%)]"
            />
            <Input
              type="text"
              placeholder="Search apps in playlist..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[hsl(192,73%,84%)] placeholder-[hsl(192,25%,65%)] focus:outline-none focus:border-white/20 focus:bg-white/10"
            />
          </div>
        </div>

        {/* Apps grid */}
        <div className="flex-1 overflow-auto">
          {filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app) => (
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
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-[hsl(192,25%,65%)]" />
              </div>
              <h3 className="text-[hsl(192,73%,84%)] text-lg font-medium mb-2">
                {searchQuery ? "No apps found" : "No apps in this playlist"}
              </h3>
              <p className="text-[hsl(192,25%,65%)] text-sm mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Add some apps to get started"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleAddApps}
                  className="bg-[hsl(192,73%,84%)] text-black hover:bg-[hsl(192,73%,88%)]"
                >
                  <Plus size={16} className="mr-2" />
                  Add Apps
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
