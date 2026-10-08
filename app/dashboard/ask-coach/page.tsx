import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AskCoachConversation } from "@/components/ask-coach/AskCoachConversation";

export const metadata: Metadata = {
  title: "Ask Coach - XamCoach",
};

export default function AskCoachPage() {
  return (
    <AppShell title="Ask Coach" breadcrumb="Intelligence">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Basketball intelligence"
          title="Ask Coach"
          description="Turn verified team data into evidence-backed coaching decisions."
        />
        <AskCoachConversation variant="page" />
      </div>
    </AppShell>
  );
}
