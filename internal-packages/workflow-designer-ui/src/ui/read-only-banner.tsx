import React from "react";
import clsx from "clsx";
import { EyeIcon, XIcon } from "lucide-react";

interface ReadOnlyBannerProps {
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
  userRole?: "viewer" | "guest" | "editor" | "owner";
}

export function ReadOnlyBanner({ 
  className,
  onDismiss,
  showDismiss = true,
  userRole = "viewer"
}: ReadOnlyBannerProps) {
  // 権限によってメッセージを変える
  const getMessage = () => {
    switch (userRole) {
      case "guest":
        return "ゲストモード：このAppは読み取り専用です。プレビューのみ実行できます。";
      case "viewer":
        return "読み取り専用モード：このAppはプレビューのみ可能です。編集するには権限が必要です。";
      default:
        return "読み取り専用モード";
    }
  };

  return (
    <div 
      className={clsx(
        "flex items-center justify-between px-4 py-2 bg-black-800 border-b border-black-700",
        className
      )}
    >
      <div className="flex items-center gap-2 text-white-900">
        <EyeIcon size={16} className="text-yellow-500" />
        <span className="text-sm font-medium">{getMessage()}</span>
      </div>
      
      {showDismiss && onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-white-800 hover:text-white-900 p-1 rounded-full"
          aria-label="閉じる"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
}

// シンプルなバッジバージョン（ヘッダーの「Text file」の隣に表示されている「Read Only」バッジ）
export function ReadOnlyBadge({ className }: { className?: string }) {
  return (
    <div 
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black-800 border border-black-700",
        "text-xs font-medium text-yellow-500",
        className
      )}
    >
      <EyeIcon size={12} />
      <span>Read Only</span>
    </div>
  );
} 