import React, { useMemo } from "react";
import clsx from "clsx";
import { Tooltip } from "./tooltip";

// Random colors for willi icons
const WILLI_COLORS = [
  "#9D71EA", // Nebula Purple: a rich purple with a slight glow
  "#4A9FF5", // Cosmic Blue: deep blue with a celestial brightness
  "#39E3B0", // Aurora Green: teal green like northern lights
  "#FF61D2", // Stardust Pink: vibrant pink like distant galaxies
  "#FF7E50", // Solar Orange: warm orange like a distant sun
  "#2DC7FF", // Comet Blue: bright ice-blue like a comet trail
  "#00B8A9", // Celestial Teal: deep teal like nebula gases
  "#E84855", // Martian Red: dusty red like the surface of Mars
  "#FFDC5E", // Pulsar Yellow: pulsing yellow like a distant star
  "#C2D3DD"  // Galactic Silver: subtle silver with blue undertones
];

// Demo user data (in real implementation, this would be fetched from backend in real-time)
const DEMO_USERS = [
  { id: "1", name: "John Doe", isGuest: true },
  { id: "2", name: "Jane Smith", isGuest: true },
  { id: "3", name: "Alex Johnson", isGuest: true },
  { id: "4", name: "Guest User", isGuest: true },
  { id: "5", name: "Anonymous", isGuest: true },
];

interface User {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  isGuest?: boolean;
}

interface UserAvatarProps {
  user: User;
  index: number;
  total: number;
}

// Get a random color from the WILLI_COLORS array
function getRandomColor() {
  return WILLI_COLORS[Math.floor(Math.random() * WILLI_COLORS.length)];
}

// Get color based on user ID
function getColorForUser(userId: string) {
  // Convert user ID to a number by summing character codes
  const sum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Use modulo to get an index within the colors array
  return WILLI_COLORS[sum % WILLI_COLORS.length];
}

// Willi icon for unknown/guest users
function WilliIcon({ color = "#6E56CF" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_willi)">
        <path fillRule="evenodd" clipRule="evenodd" d="M16.5838 15.2942C16.5838 15.2942 15.7927 15.102 14.8885 14.3492C14.4892 14.0209 14.4515 13.7807 14.4063 12.5874C14.3837 11.9547 14.3535 11.1699 14.2104 10.1449C13.8261 7.34994 11.6335 6.73329 10.443 6.78935C10.4882 6.68524 10.5108 6.58113 10.5108 6.46101C10.5108 4.99548 10.1115 3.85829 9.32032 3.09749C8.26512 2.07142 6.89773 2.12766 6.6873 2.13632L6.68315 2.13649C5.53787 2.06442 3.30004 2.65703 2.91577 5.492C2.78014 6.52508 2.75 7.30189 2.7274 7.93455C2.68219 9.12779 2.64452 9.36804 2.25271 9.69639C1.3636 10.4412 0.595058 10.6334 0.595058 10.6334C0.188181 10.7215 -0.0755364 11.1539 0.0148808 11.5864C0.0902285 11.9628 0.399154 12.219 0.753288 12.219C0.806032 12.219 0.858775 12.219 0.911519 12.203C1.02454 12.179 2.02666 11.9307 3.19455 10.9537C4.15611 10.1473 4.18895 9.24534 4.23395 8.00977L4.23435 7.99861L4.23795 7.90348C4.25964 7.32755 4.28633 6.61888 4.40765 5.71623C4.6789 3.71414 6.29135 3.70613 6.60781 3.73016C6.63277 3.73016 6.65257 3.72466 6.67576 3.71822L6.69069 3.71414C6.70274 3.71414 6.7148 3.7167 6.72685 3.71926C6.74494 3.72311 6.76302 3.72695 6.7811 3.72215L6.78321 3.72205C6.83222 3.71945 7.70812 3.673 8.32573 4.27472C8.77782 4.72319 9.0114 5.45195 9.0114 6.44499C9.0114 6.62918 9.07921 6.78935 9.17716 6.92549C8.09215 7.24583 6.88659 8.12675 6.61534 10.1368C6.47971 11.1699 6.44957 11.9547 6.42697 12.5794C6.38176 13.7726 6.34409 14.0129 5.95228 14.3412C5.06318 15.086 4.30217 15.2782 4.29463 15.2782C3.88775 15.3663 3.62404 15.7988 3.71445 16.2312C3.7898 16.6076 4.09873 16.8639 4.45286 16.8639H4.45287C4.50561 16.8639 4.55835 16.8639 4.61109 16.8479C4.72411 16.8238 5.72624 16.5756 6.89413 15.5986C7.85568 14.7921 7.88853 13.8902 7.93352 12.6546L7.93392 12.6435L7.93752 12.5483C7.95921 11.9724 7.9859 11.2637 8.10722 10.3611C8.37848 8.35899 9.98338 8.35899 10.3074 8.37501C10.3224 8.37501 10.3375 8.37301 10.3526 8.371L10.3526 8.371C10.3677 8.369 10.3827 8.367 10.3978 8.367C10.4066 8.367 10.4166 8.36943 10.4268 8.37193C10.4428 8.37584 10.4594 8.37989 10.4731 8.37501C10.6766 8.35899 12.4397 8.28692 12.7185 10.3611C12.8466 11.3061 12.8767 12.0428 12.8993 12.6355C12.9445 13.8367 12.9822 14.7817 13.9617 15.5986C15.1372 16.5756 16.1619 16.8238 16.2749 16.8479C16.3277 16.8559 16.3804 16.8639 16.4331 16.8639C16.7797 16.8639 17.0887 16.6076 17.164 16.2312C17.2544 15.7988 16.9907 15.3743 16.5914 15.2782L16.5838 15.2942ZM9.47852 10.3771C8.59695 10.3771 8.59695 11.8346 9.47852 11.8346C10.3601 11.8346 10.3601 10.3771 9.47852 10.3771ZM11.4753 10.3771C10.5937 10.3771 10.5937 11.8346 11.4753 11.8346C12.3568 11.8346 12.3568 10.3771 11.4753 10.3771ZM5.77892 5.73223C4.89735 5.73223 4.89735 7.18975 5.77892 7.18975C6.66049 7.18975 6.66049 5.73223 5.77892 5.73223ZM7.77565 5.73223C6.89409 5.73223 6.89409 7.18975 7.77565 7.18975C8.65722 7.18975 8.65722 5.73223 7.77565 5.73223Z" fill={color}/>
      </g>
      <defs>
        <clipPath id="clip0_willi">
          <rect width="18" height="18" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

// Individual user avatar
function UserAvatar({ user, index, total }: UserAvatarProps) {
  // Calculate offset for overlapping display
  const offsetStyle = {
    zIndex: total - index, // Users on the left appear on top
    marginLeft: index > 0 ? "-8px" : "0", // Overlap from the second user onwards
  };

  // For guest users, get color based on user ID
  const williColor = user.isGuest ? getColorForUser(user.id) : (user.color || "#6E56CF");
  
  // Display initial if no avatar
  const initial = user.name ? user.name.charAt(0) : "?";
  
  return (
    <Tooltip text={user.isGuest ? `Guest (${user.name})` : user.name}>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-black-900 overflow-hidden"
        style={{ 
          backgroundColor: williColor,
          ...offsetStyle
        }}
      >
        {user.isGuest ? (
          <WilliIcon color="white" />
        ) : user.avatar ? (
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
  // In real implementation, props for real-time updates would be here
  users?: User[];
  className?: string;
  maxDisplay?: number;
}

export function UserPresence({ 
  users = DEMO_USERS, // Default value for demo
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
            className="flex flex-col items-center justify-center border-2 border-black-900 text-white-900 text-xs font-medium"
            style={{ 
              marginLeft: "-8px", 
              zIndex: 0, 
              gap: "10px",
              borderRadius: "70px",
              background: "var(--primary400, #6B8FF0)",
              display: "flex",
              width: "32px",
              height: "32px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
} 