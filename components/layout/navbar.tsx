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
  Menu,
  X,
  Sparkles,
  Shield,
  ArrowRight,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();
  const totalItems = useCartStore((state) => state.totalItems);
  const cartCount = isClient ? totalItems() : 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-border/80 bg-background/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
          : "border-b border-border/40 bg-background/75 backdrop-blur-xl"
      }`}
    >
      {/* Top micro bar with contact info */}
      <div className="border-b border-border/30 bg-muted/30 px-3 sm:px-6 lg:px-8 py-1.5 text-xs text-muted-foreground hidden md:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3 xl:gap-4">
            <span className="flex items-center gap-1.5 font-bold text-xs whitespace-nowrap">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Official Distribution: <strong className="text-foreground font-extrabold">Z-Electronics</strong>
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-muted-foreground font-medium text-xs whitespace-nowrap hidden lg:inline">QC Verified Hardware</span>
            <span className="text-muted-foreground/50 hidden lg:inline">•</span>
            <a
              href="tel:8072726924"
              className="flex items-center gap-1.5 hover:text-foreground transition-all duration-150 active:scale-95 font-semibold text-xs whitespace-nowrap"
            >
              <Phone className="h-3 w-3 text-primary shrink-0" />
              <span>Direct Hotline: +91 8072726924</span>
            </a>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all duration-150 hover:scale-105 active:scale-95 text-xs whitespace-nowrap"
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              WhatsApp Engineering Desk
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between gap-2 xl:gap-4 px-3 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-border/80 bg-background/80 text-foreground hover:bg-muted active:scale-90 transition-all shrink-0 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 shrink-0 whitespace-nowrap transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full ring-2 ring-amber-500/40 overflow-hidden shadow-md group-hover:ring-amber-500/70 transition-all bg-card shrink-0">
              <img
                src="/logo.png"
                alt="Z-Electronics Logo"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col shrink-0 leading-tight">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground whitespace-nowrap">
                Z-<span className="text-primary font-black">Electronics</span>
              </span>
              <span className="text-[10px] sm:text-[11px] tracking-wider uppercase font-extrabold text-muted-foreground whitespace-nowrap">
                Silicon & Hardware Supply
              </span>
            </div>
          </Link>
        </div>

        {/* Center navigation: Responsive, never wraps text, fits all laptop widths */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink min-w-0">
          <Link
            href="/shop"
            className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer shrink-0"
          >
            <Layers className="h-4 w-4 text-primary shrink-0" />
            <span>Components</span>
          </Link>
          <Link
            href="/legacy"
            className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer shrink-0"
          >
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              <span className="xl:hidden">Projects</span>
              <span className="hidden xl:inline">Robotics & Projects</span>
            </span>
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer shrink-0"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <Package className="h-4 w-4 text-sky-500 shrink-0" />
            <span>
              <span className="xl:hidden">Tracking</span>
              <span className="hidden xl:inline">Live Tracking</span>
            </span>
          </Link>
          <a
            href="/#custom-bom"
            className="flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap text-foreground/85 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 cursor-pointer shrink-0"
          >
            <span className="text-primary font-mono text-[11px] font-black bg-primary/10 px-1 py-0.5 rounded shrink-0">BOM</span>
            <span>
              <span className="xl:hidden">Sourcing</span>
              <span className="hidden xl:inline">Custom Sourcing</span>
            </span>
          </a>

          {/* Google-Style Dynamic Color Changing Button */}
          <a
            href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-google-animated flex items-center gap-1.5 xl:gap-2 rounded-full px-3.5 xl:px-4.5 py-1.5 xl:py-2 text-xs xl:text-sm font-bold whitespace-nowrap text-foreground bg-card/85 hover:bg-card border border-transparent transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-95 ml-1 shadow-xs hover:shadow-md cursor-pointer shrink-0"
          >
            <MessageSquare className="h-4 w-4 text-[#34A853] shrink-0" />
            <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent font-black">
              <span className="xl:hidden">Support</span>
              <span className="hidden xl:inline">Engineering Support</span>
            </span>
            <span className="flex h-2 w-2 rounded-full bg-[#34A853] shadow-[0_0_6px_#34A853] animate-pulse shrink-0" />
          </a>
        </nav>

        {/* Right Actions: Always fully visible, never pushed off-screen */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Customer Account & Order Portal */}
          <CustomerAccountBtn />

          {/* Theme toggle */}
          {isClient && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:scale-90 active:rotate-45 shrink-0"
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
          <Link href="/cart" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="relative h-9 sm:h-10 gap-1.5 sm:gap-2 px-3 sm:px-4 rounded-full border-border/80 font-black text-xs sm:text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:translate-y-1 active:scale-[0.93] shrink-0 whitespace-nowrap"
            >
              <ShoppingCart className="h-4 w-4 text-primary shrink-0" />
              <span className="hidden sm:inline">My Cart</span>
              {cartCount > 0 && (
                <Badge className="animate-pop h-5 min-w-5 rounded-full px-1.5 text-[10px] sm:text-[11px] font-black bg-primary text-primary-foreground shadow-sm">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu (Slides down on phones/tablets) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-border/80 bg-background/95 backdrop-blur-2xl px-4 py-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 max-w-md mx-auto">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="leading-none">Components Catalog</p>
                  <p className="text-xs font-normal text-muted-foreground mt-1">Browse 500+ microcontrollers, sensors & ICs</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/legacy"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="leading-none">Robotics & Project Builds</p>
                  <p className="text-xs font-normal text-muted-foreground mt-1">Verified college projects and custom kits</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="leading-none">Track Active Order</p>
                  <p className="text-xs font-normal text-muted-foreground mt-1">Live tracking timeline and invoice</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <a
              href="/#custom-bom"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 font-mono text-xs font-black">
                  BOM
                </div>
                <div>
                  <p className="leading-none">Custom Hardware & BOM Sourcing</p>
                  <p className="text-xs font-normal text-muted-foreground mt-1">Direct quotes for bulk university orders</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </a>

            {/* Google-Style Support Button inside Mobile Menu */}
            <a
              href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-google-animated flex items-center justify-center gap-2.5 p-3.5 rounded-xl text-sm font-black text-foreground bg-card shadow-md active:scale-95 transition-all mt-2"
            >
              <MessageSquare className="h-4 w-4 text-[#34A853]" />
              <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent">
                WhatsApp Engineering Support Desk
              </span>
              <span className="flex h-2 w-2 rounded-full bg-[#34A853] shadow-[0_0_6px_#34A853] animate-pulse" />
            </a>

            {/* Direct Call hotline */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground px-1">
              <a href="tel:8072726924" className="flex items-center gap-1.5 hover:text-foreground font-bold">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>Call Hotline: +91 8072726924</span>
              </a>
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-foreground font-semibold flex items-center gap-1">
                <Shield className="h-3 w-3 text-amber-500" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
