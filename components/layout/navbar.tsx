"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  ShoppingCart,
  MessageSquare,
  Phone,
  Layers,
  Package,
  Trophy,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerAccountBtn } from "./customer-account-btn";

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
      <div className="border-b border-border/30 bg-muted/30 px-4 py-2 text-[13px] text-muted-foreground sm:px-6 lg:px-8 hidden sm:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-semibold text-[13px]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Official Distribution: <strong className="text-foreground font-bold">Z-Electronics</strong>
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-muted-foreground font-medium text-xs">QC Verified Hardware</span>
            <span className="text-muted-foreground/50">•</span>
            <a
              href="tel:8072726924"
              className="flex items-center gap-1.5 hover:text-foreground transition-all duration-150 active:scale-95 font-semibold text-xs"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>Direct Hotline: +91 8072726924</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all duration-150 hover:scale-105 active:scale-95 text-xs"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp Engineering Desk
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-amber-500/40 overflow-hidden shadow-md group-hover:ring-amber-500/70 group-hover:shadow-lg transition-all bg-card shrink-0">
            <img
              src="/logo.png"
              alt="Z-Electronics Logo"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-foreground leading-none">
              Z-<span className="text-primary font-black">Electronics</span>
            </span>
            <span className="text-xs tracking-wider uppercase font-extrabold text-muted-foreground mt-1">
              Silicon & Embedded Hardware
            </span>
          </div>
        </Link>

        {/* Center navigation with clear readable typography & whitespace-nowrap */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer"
          >
            <Layers className="h-4 w-4 text-primary" />
            <span>Components</span>
          </Link>
          <Link
            href="/legacy"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Robotics & Projects</span>
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
            </span>
            <Package className="h-4 w-4 text-sky-500" />
            <span>Live Tracking</span>
          </Link>
          <a
            href="/#custom-bom"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer"
          >
            <span className="text-primary font-mono text-xs font-black bg-primary/10 px-1.5 py-0.5 rounded">BOM</span>
            <span>Custom Sourcing</span>
          </a>

          {/* Google-Style Interactive Color Changing Button */}
          <a
            href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-google-animated flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold whitespace-nowrap text-foreground bg-card/85 hover:bg-card border border-transparent transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 ml-2 shadow-sm hover:shadow-lg cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-[#34A853]" />
            <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent font-black">
              Engineering Support
            </span>
            <span className="flex h-2 w-2 rounded-full bg-[#34A853] shadow-[0_0_8px_#34A853] animate-pulse shrink-0" />
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Customer Account & Order Portal */}
          <CustomerAccountBtn />

          {/* Theme toggle */}
          {isClient && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-90 active:rotate-45"
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
              className="relative h-10 gap-2.5 px-4.5 rounded-full border-border/80 font-black text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:translate-y-1 active:scale-[0.93]"
            >
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">My Cart</span>
              {cartCount > 0 && (
                <Badge className="animate-pop h-5 min-w-5 rounded-full px-1.5 text-[11px] font-black bg-primary text-primary-foreground shadow-sm">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
