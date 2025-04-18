import React from "react";
import clsx from "clsx";
import { Tooltip } from "./tooltip";

// ダミーユーザーデータ（実際の実装ではバックエンドからリアルタイムで取得）
const DEMO_USERS = [
  { id: "1", name: "山田太郎", avatar: "/avatars/user1.png", color: "#FF5733" },
  { id: "2", name: "鈴木花子", avatar: "/avatars/user2.png", color: "#33FF57" },
  { id: "3", name: "佐藤次郎", avatar: "/avatars/user3.png", color: "#3357FF" },
];

interface User {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

interface UserAvatarProps {
  user: User;
  index: number;
  total: number;
}

// 個別のユーザーアバター
function UserAvatar({ user, index, total }: UserAvatarProps) {
  // 横に重なる表示の場合、右にずらす量を計算
  const offsetStyle = {
    zIndex: total - index, // 左側のユーザーが上に表示されるように
    marginLeft: index > 0 ? "-8px" : "0", // 2人目以降は左に少し重ねる
  };

  // アバター画像がなければイニシャルを表示
  const initial = user.name ? user.name.charAt(0) : "?";
  
  return (
    <Tooltip text={user.name}>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-black-900 overflow-hidden"
        style={{ 
          backgroundColor: user.color || "#6E56CF",
          ...offsetStyle
        }}
      >
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white-900 text-sm font-bold">{initial}</span>
        )}
      </div>
    </Tooltip>
  );
}

interface UserPresenceProps {
  // 実際の実装ではここにリアルタイム更新のためのpropsが入る
  users?: User[];
  className?: string;
  maxDisplay?: number;
}

export function UserPresence({ 
  users = DEMO_USERS, // デモ用デフォルト値
  className,
  maxDisplay = 3
}: UserPresenceProps) {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className={clsx("flex items-center", className)}>
      <div className="flex">
        {displayUsers.map((user, index) => (
          <UserAvatar 
            key={user.id} 
            user={user} 
            index={index} 
            total={displayUsers.length} 
          />
        ))}
        
        {remainingCount > 0 && (
          <div 
            className="w-8 h-8 rounded-full bg-black-700 flex items-center justify-center border-2 border-black-900 text-white-900 text-xs font-medium"
            style={{ marginLeft: "-8px", zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
} 