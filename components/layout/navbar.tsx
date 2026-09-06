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
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-border/80 bg-background/85 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
          : "border-b border-border/40 bg-background/70 backdrop-blur-xl"
      }`}
    >
      {/* Top micro bar with contact info */}
      <div className="border-b border-border/30 bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground sm:px-6 lg:px-8 hidden sm:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Direct Component Supply from: <strong className="text-foreground font-semibold">Sujith</strong>
            </span>
            <span className="text-muted-foreground/50">•</span>
            <a
              href="tel:8072726924"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
            >
              <Phone className="h-3 w-3 text-primary" />
              <span>+91 8072726924</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline transition-all hover:scale-105"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Join WhatsApp Community
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-md group-hover:shadow-primary/20 transition-all">
            <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground leading-none">
              Z-<span className="text-primary font-extrabold">Electronics</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground mt-0.5">
              Silicon & Hardware Supply
            </span>
          </div>
        </Link>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <Layers className="h-3.5 w-3.5 text-primary" />
            Catalog
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Project Cart
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin Portal
          </Link>
          <a
            href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all hover:scale-105 ml-1"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
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
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-transform duration-300 active:rotate-45"
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
              className="relative h-9 gap-2 px-3.5 rounded-full border-border/80 font-semibold text-xs transition-all hover:border-primary/50 hover:shadow-sm active:scale-95"
            >
              <ShoppingCart className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <Badge className="animate-pop h-5 min-w-5 rounded-full px-1.5 text-[10px] font-extrabold bg-primary text-primary-foreground shadow-sm">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Admin shortcut button */}
          <Link href="/admin">
            <Button size="sm" className="h-9 gap-1.5 px-3.5 rounded-full font-semibold text-xs shadow-sm transition-all hover:shadow-md active:scale-95">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
