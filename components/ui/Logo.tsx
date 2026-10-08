import { cn } from "@/lib/utils";

/** Just the brand mark (no wordmark) -- reused standalone anywhere a
 * compact XamCoach identity is needed, e.g. the "coach is thinking" loading
 * state (components/ask-coach/AskCoachConversation.tsx), so that animation
 * is the app's own mark rather than a generic icon. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("flex items-center justify-center rounded-lg bg-brand-orange text-white font-bold shrink-0", className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[60%] w-[60%]">
        <path
          d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8M12 4v16M4 12h16"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { mark: "h-6 w-6", text: "text-base" },
    md: { mark: "h-8 w-8", text: "text-lg" },
    lg: { mark: "h-10 w-10", text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={sizes[size].mark} />
      <span className={cn("font-bold tracking-tight text-text-primary", sizes[size].text)}>
        Xam<span className="text-brand-orange">Coach</span>
      </span>
    </div>
  );
}
