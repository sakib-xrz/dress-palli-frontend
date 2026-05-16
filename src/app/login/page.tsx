"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconLoader2, IconLock, IconMail } from "@tabler/icons-react";
import { useAuthUser } from "@/hooks/use-auth";

function isLoginPath(path: string) {
  return path === "/login" || path.startsWith("/login?");
}

function getSafeCallbackPath(callbackUrl: string | null) {
  if (!callbackUrl || !callbackUrl.startsWith("/") || isLoginPath(callbackUrl)) {
    return null;
  }

  return callbackUrl;
}

function getSafeReferrerPath() {
  if (typeof window === "undefined" || !document.referrer) return null;

  try {
    const referrerUrl = new URL(document.referrer);
    if (referrerUrl.origin !== window.location.origin) return null;

    const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
    return isLoginPath(referrerPath) ? null : referrerPath;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading: isCheckingAuth } = useAuthUser();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isCheckingAuth || !user) return;

    const returnPath =
      getSafeCallbackPath(callbackUrl) ?? getSafeReferrerPath();

    if (returnPath) {
      router.replace(returnPath);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.replace("/");
  }, [callbackUrl, isCheckingAuth, router, user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password");
        return;
      }

      const returnPath =
        getSafeCallbackPath(callbackUrl) ?? getSafeReferrerPath();

      if (returnPath) {
        router.push(returnPath);
      } else if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingAuth || user) {
    return (
      <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
        <IconLoader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="bg-primary/5 pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        {/* Login card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error message */}
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <IconMail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="email"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <IconLock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-muted-foreground mt-6 text-center text-xs">
          Authorized personnel only. All activity is monitored.
        </p>
      </div>
    </div>
  );
}
