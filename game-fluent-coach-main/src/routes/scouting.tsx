import { createFileRoute } from "@tanstack/react-router";
import { ScoutingPage } from "@/features/analysis/scouting-page";
export const Route = createFileRoute("/scouting")({
  head: () => ({ meta: [{ title: "Scouting Reports — XamCoach" }, { name: "description", content: "Generate professional player development reports." }, { property: "og:title", content: "Scouting Reports — XamCoach" }, { property: "og:description", content: "Generate professional player development reports." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ScoutingPage,
});
