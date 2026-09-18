"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { SidebarItem } from "./SidebarItem";
import { navGroups } from "./nav-config";
import { cn } from "@/lib/utils";

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-text-primary/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[240px] shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-[64px] shrink-0 items-center justify-between px-5">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-secondary hover:bg-surface-secondary lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <SidebarItem key={item.href} item={item} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <Avatar name="Rosly" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">Rosly</p>
              <p className="truncate text-xs text-text-muted">Analyst</p>
            </div>
          </div>
          <Link
            href="/login"
            className="mt-0.5 flex h-9 items-center gap-2.5 rounded-md px-2 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-secondary hover:text-error"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
            Log out
          </Link>
        </div>
      </aside>
    </>
  );
}
