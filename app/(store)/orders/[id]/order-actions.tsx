"use client";

import { useState, useEffect } from "react";
import { Printer, MessageSquare, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentQrModal } from "@/components/checkout/payment-qr-modal";
import { PaymentConfig, getPaymentConfig } from "@/lib/actions/payment";

interface OrderActionButtonsProps {
  orderId: string;
  waText: string;
  amount?: number;
  status?: string;
}

export function OrderActionButtons({ orderId, waText, amount, status }: OrderActionButtonsProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    upiId: "8072726924@upi",
    payeeName: "Z-Electronics (Prop. Sujith)",
    qrImageUrl: "",
    phone: "8072726924",
  });

  useEffect(() => {
    getPaymentConfig().then((cfg) => {
      if (cfg) setPaymentConfig(cfg);
    });
  }, []);

  return (
    <div className="flex items-center gap-2 print:hidden">
      {amount && amount > 0 && status === "Pending" && (
        <Button
          size="sm"
          onClick={() => setIsQrOpen(true)}
          className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>Pay via QR</span>
        </Button>
      )}

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

      {amount && (
        <PaymentQrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          amount={amount}
          config={paymentConfig}
          orderId={orderId}
        />
      )}
    </div>
  );
}
