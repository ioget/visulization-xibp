import type { Metadata } from "next";
import Link from "next/link";
import { BasketballPanel } from "@/components/auth/BasketballPanel";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Log in — XamCoach",
};

export default function LoginPage() {
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
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary">
                Log in to your coaching workspace.
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
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between -mt-1">
                <Checkbox name="remember" label="Remember me" defaultChecked />
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-brand-blue hover:text-brand-blue-dark transition-colors duration-150 ease-out"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" fullWidth size="lg" className="mt-1">
                Log in
              </Button>
            </form>
          </Card>

          <div className="mt-6 text-center text-sm text-text-secondary lg:text-left">
            New to XamCoach?{" "}
            <Link
              href="/register"
              className="font-medium text-brand-orange hover:text-brand-orange-hover transition-colors duration-150 ease-out"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <BasketballPanel />
    </div>
  );
}
