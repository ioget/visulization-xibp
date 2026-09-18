import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/home/home-page";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Home — XamCoach" }, { name: "description", content: "Your team intelligence at a glance." }, { property: "og:title", content: "Home — XamCoach" }, { property: "og:description", content: "Your team intelligence at a glance." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: HomePage,
});
