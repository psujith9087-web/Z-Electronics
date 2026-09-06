import { MessageSquare, Phone, Wrench, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectCTA() {
  return (
    <section className="py-20 bg-muted/20 border-t border-border/60 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-zinc-900 to-black p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden border border-white/10">
          {/* Subtle Ambient Glow Lights */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px] animate-pulse-glow" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md mb-5 text-white/90 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Custom Hardware & BOM Sourcing</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-5xl text-white leading-[1.12]">
              Building a custom electronics project or robotics build?
            </h2>

            <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
              We assist students, hobbyists, and lab engineers in procuring specialized ICs, sensors, modules, and microcontrollers at wholesale prices. Connect directly with owner <strong className="text-white font-semibold">Sujith</strong> for Bill of Materials (BOM) quotations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a
                href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="h-12 px-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-950/50">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Sujith</span>
                </Button>
              </a>

              <a href="tel:8072726924">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/15 font-semibold text-xs gap-2 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                >
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>Call +91 8072726924</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

