"use client";

import { Printer, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderActionButtonsProps {
  orderId: string;
  waText: string;
}

export function OrderActionButtons({ orderId, waText }: OrderActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="gap-1.5 text-xs font-semibold"
      >
        <Printer className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Print / Save</span> PDF
      </Button>

      <a
        href={`https://wa.me/918072726924?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>WhatsApp</span>
        </Button>
      </a>
    </div>
  );
}
