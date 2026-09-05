import { checkAdminSession, adminLogout } from "@/lib/actions/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Shield, LogOut, ArrowUpRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-foreground text-base tracking-tight block leading-tight">
                Z-Electronics <span className="text-primary">Admin</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Managed by Sujith (8072726924)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View storefront link */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/80 bg-background"
            >
              <span>View Storefront</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            {/* Logout button */}
            <form action={adminLogout}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="h-9 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
