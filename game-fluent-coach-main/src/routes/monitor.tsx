import { createFileRoute } from "@tanstack/react-router";
import { MonitorPage } from "@/features/platform/platform-pages";
export const Route = createFileRoute("/monitor")({
  head: () => ({ meta: [{ title: "System Monitor — XamCoach" }, { name: "description", content: "Operational health for XamCoach intelligence services." }, { property: "og:title", content: "System Monitor — XamCoach" }, { property: "og:description", content: "Operational health for XamCoach intelligence services." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: MonitorPage,
});
