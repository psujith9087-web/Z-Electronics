"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Lock, Mail, Loader2, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminLogin } from "@/lib/actions/admin-auth";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const res = await adminLogin(formData);

      if (res.success) {
        toast.success("Welcome back, Admin!");
        window.location.href = "/admin";
      } else {
        setError(res.error || "Invalid credentials.");
      }
    } catch {
      setError("An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back link */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Customer Storefront
          </Link>
        </div>

        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Shield className="size-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Z-Electronics Admin Portal
          </h1>
          <p className="text-xs text-muted-foreground">
            Secure inventory & order management for Sujith and staff
          </p>
        </div>

        {/* Login Card */}
        <Card className="border shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Admin Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your admin credentials to manage components and customer orders.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-email" className="text-xs font-semibold">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@z-electronics.com"
                    required
                    className="pl-9 h-11 bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-password" className="text-xs font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-9 h-11 bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="mt-2 h-11 w-full font-bold">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  "Log In to Dashboard"
                )}
              </Button>

              {/* Quick credential tip */}
              <div className="mt-2 rounded-xl bg-muted/50 p-3 border text-[11px] text-muted-foreground flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground mb-0.5">Admin Access Hint:</p>
                  <p>
                    Use <strong className="text-foreground">admin@z-electronics.com</strong> with password <strong className="text-foreground">admin123</strong>.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-7 px-2.5 shrink-0 font-semibold"
                  onClick={() => {
                    setEmail("admin@z-electronics.com");
                    setPassword("admin123");
                  }}
                >
                  Autofill
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
