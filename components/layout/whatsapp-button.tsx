"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition-all hover:-translate-y-1 hover:scale-110 hover:bg-emerald-700 animate-in fade-in zoom-in duration-300 ring-4 ring-emerald-500/20"
      title="Join Z-Electronics WhatsApp Community"
      aria-label="Join Z-Electronics WhatsApp Community"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
