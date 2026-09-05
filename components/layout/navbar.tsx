"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Zap,
  Sun,
  Moon,
  ShoppingCart,
  Shield,
  MessageSquare,
  Phone,
  Layers,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Hydration-safe helper to detect client mounting without triggering setState in useEffect
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();
  const totalItems = useCartStore((state) => state.totalItems);
  const cartCount = isClient ? totalItems() : 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        isScrolled
          ? "border-border bg-background/95 shadow-sm backdrop-blur-md"
          : "border-border/40 bg-background/80 backdrop-blur-sm"
      }`}
    >
      {/* Top micro bar with contact info */}
      <div className="bg-muted/40 border-b border-border/40 px-4 py-1.5 text-xs text-muted-foreground sm:px-6 lg:px-8 hidden sm:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Direct Supply from Owner: <strong className="text-foreground">Sujith</strong>
            </span>
            <span>•</span>
            <a
              href="tel:8072726924"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Phone className="h-3 w-3 text-primary" />
              8072726924
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              <MessageSquare className="h-3 w-3" />
              Join WhatsApp Community
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-tight">
              Z-<span className="text-primary">Electronics</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:inline">
              Components & Supply
            </span>
          </div>
        </Link>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            <Layers className="h-4 w-4 text-primary" />
            Catalog
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Project Cart
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Link>
          <a
            href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors ml-2"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Community
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          {isClient && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Cart button */}
          <Link href="/cart">
            <Button
              variant="outline"
              size="sm"
              className="relative h-9 gap-2 px-3 rounded-lg border-border font-medium"
            >
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[11px] font-bold bg-primary text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Admin shortcut button */}
          <Link href="/admin">
            <Button size="sm" variant="default" className="h-9 gap-1.5 px-3 rounded-lg font-medium text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
