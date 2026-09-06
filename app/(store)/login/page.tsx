"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail, User, Zap } from "lucide-react";

import { signIn, signUp, loginWithPhone } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl ring-2 ring-primary/20 overflow-hidden shadow-md bg-card group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Z-Electronics Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              Z-<span className="text-primary">Electronics</span>
            </span>
          </Link>
          <p className="text-sm font-semibold text-foreground mt-1">
            Customer Account & Order Portal
          </p>
          <p className="text-xs text-muted-foreground">
            Sign in with your mobile number or email to view and track your orders.
          </p>
        </div>

        {/* Auth card */}
        <Card className="border shadow-lg rounded-2xl overflow-hidden">
          <Tabs defaultValue="phone">
            <CardHeader className="pb-2 bg-muted/20 border-b">
              <TabsList className="w-full grid grid-cols-3 h-10">
                <TabsTrigger value="phone" className="text-xs font-bold">
                  Quick Phone
                </TabsTrigger>
                <TabsTrigger value="signin" className="text-xs font-bold">
                  Email Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-xs font-bold">
                  Register
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <Suspense fallback={<div className="flex justify-center items-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
                <TabsContent value="phone">
                  <PhoneLoginForm />
                </TabsContent>
                <TabsContent value="signin">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="signup">
                  <SignUpForm />
                </TabsContent>
              </Suspense>
            </CardContent>
          </Tabs>
        </Card>

        {/* Quick track without login link */}
        <div className="mt-6 text-center">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <span>Have an Order ID or Phone number?</span>
            <strong className="underline text-foreground">Track Order Directly</strong>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}

// --- Quick Phone Login -----------------------------------

function PhoneLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/orders";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirect", redirectTo);

    try {
      const result = await loginWithPhone(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      router.push(redirectTo);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone-name" className="text-xs font-semibold">Your Full Name</Label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone-name"
            name="full_name"
            type="text"
            placeholder="e.g. Sujith"
            required
            className="pl-9 h-11 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone-number" className="text-xs font-semibold">10-Digit Mobile Number</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
            +91
          </span>
          <Input
            id="phone-number"
            name="phone"
            type="tel"
            placeholder="9876543210"
            required
            pattern="[0-9]{10}"
            title="Please enter a 10-digit mobile number"
            className="pl-12 h-11 text-sm"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          All orders placed with this mobile number will appear in your account immediately.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone-email" className="text-xs font-medium text-muted-foreground">
          Email Address (Optional)
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="pl-9 h-10 text-sm"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="mt-2 w-full h-11 font-bold text-sm">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Signing in…
          </>
        ) : (
          "Access My Orders & Account"
        )}
      </Button>
    </form>
  );
}

// --- Sign In ---------------------------------------------

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirect", redirectTo);

    try {
      const result = await signIn(formData);
      // signIn redirects on success; if we get here there's an error
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect() throws a NEXT_REDIRECT error — that's fine
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            className="pl-9"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}

// --- Sign Up ---------------------------------------------

function SignUpForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Client-side validation
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-700/30 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-name">Full Name</Label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-name"
            name="full_name"
            type="text"
            placeholder="John Doe"
            required
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-phone">Phone</Label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-phone"
            name="phone"
            type="tel"
            placeholder="10-digit mobile number"
            required
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-confirm-password"
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            className="pl-9"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
