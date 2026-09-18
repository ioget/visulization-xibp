import { createFileRoute } from "@tanstack/react-router";
import { AskCoachPage } from "@/features/intelligence/ask-coach-page";
export const Route = createFileRoute("/ask-coach")({
  head: () => ({ meta: [{ title: "Ask Coach — XamCoach" }, { name: "description", content: "Evidence-backed basketball intelligence for coaching decisions." }, { property: "og:title", content: "Ask Coach — XamCoach" }, { property: "og:description", content: "Evidence-backed basketball intelligence for coaching decisions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AskCoachPage,
});
