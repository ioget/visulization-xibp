import { createFileRoute } from "@tanstack/react-router";
import { PracticePage } from "@/features/coaching/practice-page";
export const Route = createFileRoute("/practice")({
  head: () => ({ meta: [{ title: "Practice Planner — XamCoach" }, { name: "description", content: "Build focused coaching sessions from team performance signals." }, { property: "og:title", content: "Practice Planner — XamCoach" }, { property: "og:description", content: "Build focused coaching sessions from team performance signals." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: PracticePage,
});
