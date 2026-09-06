"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 group flex items-center">
      {/* Interactive Tooltip on hover */}
      <div className="pointer-events-none absolute right-16 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden sm:flex items-center gap-2 whitespace-nowrap rounded-full bg-background/95 border border-border/80 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Chat with Sujith on WhatsApp</span>
      </div>

      {/* Outer Pulse Ring */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-radar pointer-events-none" />

      {/* Main Floating Button */}
      <a
        href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_8px_30px_rgb(16,185,129,0.35)] transition-all duration-300 hover:scale-110 active:scale-95 ring-4 ring-emerald-500/20"
        title="Join Z-Electronics WhatsApp Community"
        aria-label="Join Z-Electronics WhatsApp Community"
      >
        <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12 duration-300" />
      </a>
    </div>
  );
}

