"use client";

import { useState } from "react";
import { PaymentConfig } from "@/lib/actions/payment";
import { formatPrice } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, Check, MessageSquare, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  config: PaymentConfig;
  orderId?: string;
}

export function PaymentQrModal({ isOpen, onClose, amount, config, orderId }: PaymentQrModalProps) {
  const [copied, setCopied] = useState(false);

  const formattedAmount = formatPrice(amount);

  // Dynamic UPI URL if custom image is not provided
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
    `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${amount}&cu=INR`
  )}`;

  const activeQrSrc = config.qrImageUrl || dynamicQrUrl;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanPhone = (config.phone || "8072726924").replace(/\D/g, "");
  const waMsg = encodeURIComponent(
    `Hello Sujith, I am paying ${formattedAmount} for Z-Electronics order ${orderId ? "#" + orderId.slice(0, 8) : "cart"}. Here is my payment confirmation.`
  );

  // Deep link for mobile devices
  const upiDeepLink = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${amount}&cu=INR`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-3xl border-border/80 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="text-center pb-1">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
            <QrCode className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight text-foreground">
            Scan & Pay via UPI
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fast, secure direct payment to proprietor Sujith (Z-Electronics)
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-4 py-2">
          {/* Amount Showcase Badge */}
          <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-3 border border-primary/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Payable Amount:</span>
            <span className="text-2xl font-black text-primary">{formattedAmount}</span>
          </div>

          {/* QR Code Container */}
          <div className="relative p-4 bg-white rounded-3xl shadow-xl border-2 border-primary/20 group">
            <div className="relative h-56 w-56 flex items-center justify-center overflow-hidden rounded-2xl bg-white">
              <img
                src={activeQrSrc}
                alt="Z-Electronics UPI Payment QR"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = dynamicQrUrl;
                }}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md shrink-0 whitespace-nowrap">
              Google Pay • PhonePe • Paytm
            </div>
          </div>

          {/* Payee Details & Copy UPI */}
          <div className="w-full space-y-2 pt-1">
            <div className="flex items-center justify-between rounded-xl bg-muted/60 p-2.5 text-xs">
              <div className="text-left">
                <span className="text-[10px] text-muted-foreground block font-medium">Official Payee:</span>
                <span className="font-bold text-foreground">{config.payeeName}</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                <ShieldCheck className="h-3 w-3 mr-1 inline" /> Verified
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-xl border bg-background p-2.5 text-xs">
              <div className="text-left font-mono truncate mr-2">
                <span className="text-[10px] text-muted-foreground block font-sans">UPI ID:</span>
                <span className="font-bold text-foreground text-xs">{config.upiId}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUpi}
                className="h-7 text-xs gap-1 shrink-0 font-semibold rounded-lg"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Action Buttons: Mobile Deep Link & WhatsApp Confirmation */}
          <div className="w-full space-y-2 pt-1">
            {/* Direct UPI App link on mobile */}
            <a
              href={upiDeepLink}
              className="block sm:hidden w-full"
            >
              <Button className="w-full h-11 font-bold text-xs gap-2 rounded-xl bg-primary text-primary-foreground shadow-md">
                <span>Pay ${formattedAmount} in UPI App</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </a>

            <a
              href={`https://wa.me/91${cleanPhone}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 font-bold text-xs gap-2 rounded-xl border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                Share Screenshot on WhatsApp (+91 ${config.phone})
              </Button>
            </a>

            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
            >
              Close Window
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
