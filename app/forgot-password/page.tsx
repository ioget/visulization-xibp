import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BasketballPanel } from "@/components/auth/BasketballPanel";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Reset password — XamCoach",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex items-center justify-center overflow-hidden bg-page px-4 py-12 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-150 w-225 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-[0.10] blur-3xl"
          style={{
            background: "radial-gradient(closest-side, var(--color-orange) 0%, transparent 70%)",
          }}
        />

        <div className="relative w-full max-w-120">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Logo size="lg" />
          </div>

          <Card className="px-8 py-9 sm:px-10 sm:py-10">
            <div className="mb-7 text-center lg:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Reset your password
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>
            </div>

            <form className="flex flex-col gap-5" noValidate>
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="you@club.com"
                autoComplete="email"
                required
              />

              <Button type="submit" fullWidth size="lg" className="mt-1">
                Send reset link
              </Button>
            </form>

            <Link
              href="/login"
              className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:text-text-primary lg:justify-start"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to log in
            </Link>
          </Card>
        </div>
      </div>

      <BasketballPanel />
    </div>
  );
}
