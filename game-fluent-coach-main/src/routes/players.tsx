import { createFileRoute } from "@tanstack/react-router";
import { PlayerPage } from "@/features/analysis/player-page";
export const Route = createFileRoute("/players")({
  head: () => ({ meta: [{ title: "Player Analysis — XamCoach" }, { name: "description", content: "Professional player performance, trend, and shot analysis." }, { property: "og:title", content: "Player Analysis — XamCoach" }, { property: "og:description", content: "Professional player performance, trend, and shot analysis." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: PlayerPage,
});
