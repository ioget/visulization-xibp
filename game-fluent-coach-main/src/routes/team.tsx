import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/features/analysis/team-page";
export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team Analysis — XamCoach" }, { name: "description", content: "Roster intelligence and league-relative team analysis." }, { property: "og:title", content: "Team Analysis — XamCoach" }, { property: "og:description", content: "Roster intelligence and league-relative team analysis." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: TeamPage,
});
