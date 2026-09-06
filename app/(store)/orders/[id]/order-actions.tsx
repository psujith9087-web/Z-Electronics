"use client";

import { useState, useEffect } from "react";
import { Printer, MessageSquare, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnlinePaymentGateway } from "@/components/checkout/online-payment-gateway";
import { getPaymentConfig } from "@/lib/actions/payment";
import { PaymentConfig } from "@/lib/types";
import { useRouter } from "next/navigation";

interface OrderActionButtonsProps {
  orderId: string;
  waText: string;
  amount?: number;
  status?: string;
  paymentStatus?: string;
  customerName?: string;
  customerPhone?: string;
}

export function OrderActionButtons({
  orderId,
  waText,
  amount,
  status,
  paymentStatus,
  customerName = "Valued Customer",
  customerPhone = "",
}: OrderActionButtonsProps) {
  const router = useRouter();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    upiId: "psujith9087-1@okicici",
    payeeName: "Z-Electronics (Sujith)",
    qrImageUrl: "",
    phone: "8072726924",
    razorpayEnabled: true,
    codEnabled: true,
  });

  useEffect(() => {
    getPaymentConfig().then((cfg) => {
      if (cfg) setPaymentConfig(cfg);
    });
  }, []);

  const isPaid = paymentStatus === "paid" || status === "Completed" || status === "paid";

  return (
    <div className="flex items-center gap-2 print:hidden">
      {amount && amount > 0 && !isPaid && (
        <Button
          size="sm"
          onClick={() => setIsPaymentOpen(true)}
          className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer rounded-xl"
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Pay Online</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="gap-1.5 text-xs font-bold shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all rounded-xl"
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
          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all rounded-xl"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>WhatsApp</span>
        </Button>
      </a>

      {amount && (
        <OnlinePaymentGateway
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          orderId={orderId}
          amount={amount}
          customerName={customerName}
          customerPhone={customerPhone}
          config={paymentConfig}
          onPaymentSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
