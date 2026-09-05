import { MessageSquare, Phone, Wrench, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectCTA() {
  return (
    <section className="py-16 bg-muted/30 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Subtle decoration circles */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur mb-4">
              <Wrench className="h-3.5 w-3.5 text-blue-300" />
              <span>Custom Hardware & BOM Sourcing</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Working on a specialized electronics project or IoT build?
            </h2>

            <p className="mt-4 text-blue-100/90 text-sm sm:text-base leading-relaxed">
              We assist students, hobbyists, and commercial prototyping labs in sourcing custom components, microcontrollers, and sensor arrays at wholesale prices. Contact Sujith directly for Bill of Materials (BOM) quotations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Sujith
                </Button>
              </a>

              <a href="tel:8072726924">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call 8072726924
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
