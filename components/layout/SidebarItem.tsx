"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";

export function SidebarItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex h-[38px] items-center gap-2.5 rounded-md pl-3.5 pr-3 text-sm font-medium transition-colors duration-150 ease-out",
        isActive
          ? "bg-brand-orange-soft text-brand-orange"
          : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
      )}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-orange"
        />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
