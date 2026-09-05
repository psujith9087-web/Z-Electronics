import Link from "next/link";
import { Zap, Cpu, Sparkles, MessageSquare, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/15 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top announcement pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-xs sm:text-sm font-medium text-foreground shadow-sm backdrop-blur mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Electronics Component Supply & Project Fulfillment</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Direct from Sujith</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground max-w-4xl mx-auto">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Z-Electronics</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your direct source for microcontrollers, sensors, ICs, development boards, and hardware modules.
          Hand-tested components with immediate project billing and fast dispatch.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#catalog">
            <Button size="lg" className="h-12 px-6 gap-2 text-base font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
              <Cpu className="h-5 w-5" />
              Browse Catalog
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
              className="h-12 px-6 gap-2 text-base font-semibold border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600"
            >
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Join WhatsApp Community
            </Button>
          </a>

          <a href="tel:8072726924">
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-5 gap-2 text-base font-medium text-muted-foreground hover:text-foreground"
            >
              <PhoneCall className="h-4 w-4" />
              Call Sujith (8072726924)
            </Button>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-border/50 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Verified Genuine Parts</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Instant Invoice Generation</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span>DIY & Engineering Kits</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            <span>Active Maker Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
