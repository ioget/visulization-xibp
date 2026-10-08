"use client";

import { ReactNode, useState } from "react";
import { AskCoachWidget } from "@/components/ask-coach/AskCoachWidget";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { RouteLoadingBar } from "./RouteLoadingBar";

export function AppShell({
  children,
  title,
  breadcrumb,
}: {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <RouteLoadingBar />
      <div className="min-h-screen bg-page lg:flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={title} breadcrumb={breadcrumb} onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">{children}</main>
        </div>

        <AskCoachWidget />
      </div>
    </>
  );
}
