import { createFileRoute } from "@tanstack/react-router";
import { KnowledgePage } from "@/features/platform/platform-pages";
export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Knowledge Graph — XamCoach" }, { name: "description", content: "Explore basketball concepts and their relationships." }, { property: "og:title", content: "Knowledge Graph — XamCoach" }, { property: "og:description", content: "Explore basketball concepts and their relationships." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: KnowledgePage,
});
