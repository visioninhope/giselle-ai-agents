"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// NavigationItem component to handle active state
export function NavigationItem({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: ReactNode; 
  label: string 
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-white-400 hover:text-white"
    >
      {icon}
      <span className={`text-[14px] font-hubot ${isActive ? "font-medium border-b border-white-400 pb-0" : ""}`}>
        {label}
      </span>
    </Link>
  );
} 