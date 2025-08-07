import type { InferSelectModel } from "drizzle-orm";
import type { teams } from "@/drizzle";

interface TeamCardProps {
  team?: Pick<
    InferSelectModel<typeof teams>,
    "id" | "name" | "profileImageUrl"
  >;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <div
      className="bg-[var(--color-stage-form-background)] border border-white/10 p-2"
      style={{
        width: "96px",
        height: "128px",
        borderRadius: "4px 4px 16px 4px",
      }}
    >
      <div className="space-y-1 flex flex-col items-center">
        <div
          className="bg-gray-600 rounded-sm overflow-hidden flex items-center justify-center"
          style={{
            width: "72px",
            height: "72px",
          }}
        >
          {team?.profileImageUrl ? (
            <img
              src={team.profileImageUrl}
              alt={`${team.name} profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-[12px] text-center">
              No Image
            </div>
          )}
        </div>
        <div
          className="text-[10px] text-white-900 leading-tight overflow-hidden text-center"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as any,
            wordBreak: "break-word",
            height: "24px", // 12px * 2 lines with spacing
          }}
        >
          {team?.name || "team name"}
        </div>
      </div>
    </div>
  );
}
