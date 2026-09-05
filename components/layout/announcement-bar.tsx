"use client";

import { useState } from "react";
import { X, Sparkles, MessageSquare } from "lucide-react";

export function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-white">
      <div className="flex items-center justify-center gap-2 text-xs font-medium sm:text-sm text-center">
        <Sparkles className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
        <span>🚀 <strong>Direct Electronics Supply:</strong> Hand-tested parts, instant project bills, and maker support from owner Sujith.</span>
        <a
          href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline font-bold hover:text-emerald-200 ml-1 text-xs"
        >
          <MessageSquare className="h-3 w-3" />
          Join WhatsApp
        </a>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
