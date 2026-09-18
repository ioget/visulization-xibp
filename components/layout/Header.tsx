"use client";

import { Menu, Bell } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

export function Header({
  title,
  breadcrumb,
  onMenuClick,
}: {
  title: string;
  breadcrumb?: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-[64px] shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-text-secondary hover:bg-surface-secondary lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="truncate text-base font-semibold text-text-primary">{title}</h1>
            {breadcrumb && (
              <span className="hidden truncate text-sm text-text-muted sm:inline">
                / {breadcrumb}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" dot className="hidden sm:inline-flex">
          AI Ready
        </Badge>

        <button
          type="button"
          className="relative rounded-md p-2 text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-secondary hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>

        <Dropdown trigger={<Avatar name="Rosly" size="sm" />}>
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-text-primary">Rosly</p>
            <p className="text-xs text-text-muted">Analyst</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <DropdownItem>Profile settings</DropdownItem>
          <DropdownItem>Log out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
