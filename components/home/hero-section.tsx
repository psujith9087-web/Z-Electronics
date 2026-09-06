import Link from "next/link";
import {
  Zap,
  Cpu,
  Sparkles,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Activity,
  CheckCircle2,
  FileText,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background py-16 sm:py-24 lg:py-28 tech-dot-pattern">
      {/* ── Ambient Glowing Lights (Apple Keynote Style) ────────────────── */}
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-[140px] rounded-full animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/3 -right-48 w-[400px] h-[400px] bg-emerald-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 -left-48 w-[350px] h-[350px] bg-violet-500/10 blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* ── Top Announcement Pill ────────────────────────────────────── */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-1.5 text-xs font-semibold text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.04)] backdrop-blur-md mb-8 transition-all hover:border-primary/40 hover:scale-105 duration-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-shimmer font-bold">Direct Silicon & Component Supply</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-foreground/90">Managed by Sujith</span>
        </div>

        {/* ── Main Headline ────────────────────────────────────────────── */}
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] sm:text-6xl lg:text-7xl text-foreground max-w-4xl mx-auto leading-[1.08]">
          Engineered for Makers. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">
            Supplied with Precision.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal tracking-tight">
          Welcome to <strong className="text-foreground font-semibold">Z-Electronics</strong>. High-reliability microcontrollers, precision sensors, active ICs, and prototyping hardware with instant invoice generation.
        </p>

        {/* ── Floating Interactive Preview Chips ───────────────────────── */}
        <div className="hidden lg:block relative max-w-3xl mx-auto my-6 pointer-events-none">
          {/* Left Floating Chip */}
          <div className="animate-float absolute -top-12 -left-12 flex items-center gap-3 rounded-2xl bg-card/90 border border-border/70 p-3 shadow-xl backdrop-blur-xl pointer-events-auto transition-transform hover:scale-105 duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="text-left pr-2">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-foreground">ESP32 Wi-Fi + BT</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Dual Core 240MHz • ₹450</span>
            </div>
          </div>

          {/* Right Floating Chip */}
          <div className="animate-float-reverse absolute -top-10 -right-8 flex items-center gap-3 rounded-2xl bg-card/90 border border-border/70 p-3 shadow-xl backdrop-blur-xl pointer-events-auto transition-transform hover:scale-105 duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-left pr-2">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-[11px] font-bold text-foreground">Arduino Uno R3</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Original ATmega328P • ₹550</span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ───────────────────────────────────────────── */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          <a href="#catalog">
            <Button size="lg" className="h-12 px-7 rounded-full text-sm font-semibold shadow-md hover:shadow-xl transition-all hover:scale-[1.03] active:scale-95 gap-2">
              <Cpu className="h-4 w-4" />
              <span>Explore Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>

          <a
            href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 rounded-full text-sm font-semibold border-emerald-600/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-600 transition-all hover:scale-[1.03] active:scale-95 gap-2 shadow-sm"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span>Join WhatsApp Group</span>
            </Button>
          </a>

          <a href="tel:8072726924">
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all hover:scale-[1.03] active:scale-95 gap-2"
            >
              <PhoneCall className="h-4 w-4 text-primary" />
              <span>Call Sujith (8072726924)</span>
            </Button>
          </a>
        </div>

        {/* ── Bento Feature Highlight Cards (Apple Style) ─────────────── */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          {/* Card 1 */}
          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground tracking-tight">Verified Genuine Silicon</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Every IC, microcontroller, and board is bench-tested for proper pin voltages and bootloader response.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground tracking-tight">Instant PDF Invoice</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Place your order in seconds and get an official itemized bill ready to print, save, or share directly on WhatsApp.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-3 group-hover:scale-110 transition-transform">
              <Boxes className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground tracking-tight">Live Stock Inventory</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Real-time database tracking with automated decrement triggers ensures what you order is physically in stock.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 mb-3 group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground tracking-tight">Direct Maker Support</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Personalized technical guidance from owner Sujith for circuit pinouts, project wiring, and component substitutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

