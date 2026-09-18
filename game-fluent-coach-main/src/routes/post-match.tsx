import { createFileRoute } from "@tanstack/react-router";
import { PostMatchPage } from "@/features/games/game-pages";
export const Route = createFileRoute("/post-match")({
  head: () => ({ meta: [{ title: "Post-Match Analysis — XamCoach" }, { name: "description", content: "Game flow, key performers, and evidence-backed interpretation." }, { property: "og:title", content: "Post-Match Analysis — XamCoach" }, { property: "og:description", content: "Game flow, key performers, and evidence-backed interpretation." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: PostMatchPage,
});
