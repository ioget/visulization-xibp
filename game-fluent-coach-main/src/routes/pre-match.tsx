import { createFileRoute } from "@tanstack/react-router";
import { PreMatchPage } from "@/features/games/game-pages";
export const Route = createFileRoute("/pre-match")({
  head: () => ({ meta: [{ title: "Pre-Match Intelligence — XamCoach" }, { name: "description", content: "Opponent matchup data and tactical preparation." }, { property: "og:title", content: "Pre-Match Intelligence — XamCoach" }, { property: "og:description", content: "Opponent matchup data and tactical preparation." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: PreMatchPage,
});
