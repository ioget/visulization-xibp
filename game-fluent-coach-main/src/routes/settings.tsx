import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/platform/platform-pages";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — XamCoach" }, { name: "description", content: "Manage your coaching profile and preferences." }, { property: "og:title", content: "Settings — XamCoach" }, { property: "og:description", content: "Manage your coaching profile and preferences." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: SettingsPage,
});
