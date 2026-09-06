import Link from "next/link";
import { Phone, User, MessageSquare, ShieldCheck, Truck, Cpu, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-muted/20 to-muted/60">
      {/* -- Highlighted Contact & Community Banner ----------------- */}
      <div className="border-b border-border/50 bg-primary/5 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-card p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Join our WhatsApp Maker Community
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get instant stock updates, project help, datasheet assistance, and bulk discounts.
                </p>
              </div>
            </div>
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-all hover:scale-[1.02] shrink-0"
            >
              <MessageSquare className="h-4 w-4" />
              Join WhatsApp Community
            </a>
          </div>
        </div>
      </div>

      {/* -- Main Footer Info -------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-amber-500/30 overflow-hidden shadow-md group-hover:ring-amber-500/60 transition-all bg-card shrink-0">
                <img
                  src="/logo.png"
                  alt="Z-Electronics Logo"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Z-<span className="text-primary">Electronics</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your trusted partner for genuine electronic components, microcontrollers, sensors, and robotics modules.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>100% Tested & Verified Components</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Fast Nationwide Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span>Project & Engineering Support</span>
              </div>
            </div>
          </div>

          {/* Business & Direct Contact (Explicit User Requirement) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Direct Contact & Support
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 rounded-lg border border-border/80 bg-background/50 p-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Business Owner</span>
                  <span className="font-semibold text-foreground">Sujith</span>
                </div>
              </li>
              <li className="flex items-center gap-3 rounded-lg border border-border/80 bg-background/50 p-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Call / WhatsApp</span>
                  <a
                    href="tel:8072726924"
                    className="font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    8072726924
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Mon – Sat: 9:00 AM – 8:00 PM IST</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Component Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Track Orders & Status
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Checkout & Invoice
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Ordering */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Custom Project Orders
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Need bulk quantities or specific ICs not listed on our site? Connect directly with owner Sujith on WhatsApp.
            </p>
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <MessageSquare className="h-4 w-4" />
              Join Community Link →
            </a>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        {/* -- Bottom Bar ------------------------------------------ */}
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {year} Z-Electronics. All rights reserved. Managed by Sujith.</p>
          <div className="flex items-center gap-4">
            <span>Customer Support: 8072726924</span>
            <span>•</span>
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              WhatsApp Community
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
