"use client";

import { useState } from "react";
import { PaymentConfig } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/actions/razorpay";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  QrCode,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  Loader2,
  Zap,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface OnlinePaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  config: PaymentConfig;
  onPaymentSuccess: (paymentId: string) => void;
}

// Helper to load external script safely
function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function OnlinePaymentGateway({
  isOpen,
  onClose,
  orderId,
  amount,
  customerName,
  customerPhone,
  config,
  onPaymentSuccess,
}: OnlinePaymentGatewayProps) {
  const [activeTab, setActiveTab] = useState<"razorpay" | "upi_qr">("razorpay");
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const formattedAmount = formatPrice(amount);

  // Trigger celebration confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7"],
      });
    } catch {
      // Ignore if canvas is not supported
    }
  };

  // Launch Razorpay Standard Checkout
  const handlePayWithRazorpay = async () => {
    setIsProcessingRazorpay(true);
    try {
      const isLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!isLoaded) {
        toast.error("Could not load Razorpay payment gateway. Switching to Direct UPI QR.");
        setActiveTab("upi_qr");
        return;
      }

      const res = await createRazorpayOrder(amount, orderId);

      if (!res.success || !res.orderId || !res.keyId) {
        if (res.isNotConfigured) {
          toast.info("Razorpay is not yet configured. Please scan the official UPI QR code below.");
          setActiveTab("upi_qr");
          return;
        }
        toast.error(res.error || "Failed to initialize Razorpay order.");
        return;
      }

      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency || "INR",
        name: "Z-Electronics",
        description: `Order #${orderId.slice(0, 8)} Payment`,
        image: "/logo.png",
        order_id: res.orderId,
        prefill: {
          name: customerName,
          contact: customerPhone,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingRazorpay(false);
            toast.info("Payment window closed.");
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          toast.loading("Verifying payment authenticity...");
          try {
            const verifyRes = await verifyRazorpayPayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              triggerCelebration();
              toast.success("Payment Received! Order confirmed.");
              onPaymentSuccess(response.razorpay_payment_id);
              onClose();
            } else {
              toast.error(verifyRes.error || "Payment verification failed.");
            }
          } catch {
            toast.error("Error confirming payment.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        toast.error(`Payment Failed: ${response.error.description || "Transaction cancelled"}`);
      });
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error initiating payment";
      toast.error(msg);
    } finally {
      setIsProcessingRazorpay(false);
    }
  };

  // Direct UPI UTR submission
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      toast.error("Please enter a valid 12-digit UPI Transaction ID / UTR number.");
      return;
    }

    setIsVerifyingUtr(true);
    try {
      // Record payment with UTR reference
      triggerCelebration();
      toast.success("Payment details submitted! Order marked as Payment Received.");
      onPaymentSuccess(`UPI-UTR-${cleanUtr}`);
      onClose();
    } catch {
      toast.error("Error submitting payment reference.");
    } finally {
      setIsVerifyingUtr(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Dynamic UPI URL for QR
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${amount}&cu=INR`
  )}`;
  const activeQrSrc = config.qrImageUrl || dynamicQrUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-primary to-blue-700 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Lock className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted & Authentic
            </div>
            <DialogTitle className="text-2xl font-black text-white">
              Complete Online Payment
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs">
              Order #{orderId.slice(0, 8).toUpperCase()} • Total: <strong className="text-white text-sm">{formattedAmount}</strong>
            </DialogDescription>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-3 bg-muted/40 border-b border-border/50 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("razorpay")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "razorpay"
                ? "bg-background text-primary shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="w-4 h-4 text-primary" />
            Razorpay Gateway
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upi_qr")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "upi_qr"
                ? "bg-background text-primary shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            Scan UPI QR Code
          </button>
        </div>

        <div className="p-6">
          {activeTab === "razorpay" ? (
            <div className="space-y-6 text-center">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary hover:bg-primary text-white text-[10px] font-bold">
                    Official Gateway
                  </Badge>
                  <span className="text-xs font-bold text-foreground">Razorpay Secure Checkout</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pay directly using Google Pay, PhonePe, Paytm, BHIM, Debit/Credit Card (Visa, Mastercard, RuPay), or Netbanking. Your payment is verified instantly and the order will be confirmed automatically.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">Supported:</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">GPay</span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">PhonePe</span>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded">Paytm</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">UPI QR</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-500/10 px-2 py-0.5 rounded">Cards</span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                type="button"
                size="lg"
                disabled={isProcessingRazorpay}
                onClick={handlePayWithRazorpay}
                className="w-full h-13 text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-150 active:scale-[0.97] active:translate-y-0.5 cursor-pointer rounded-2xl gap-2"
              >
                {isProcessingRazorpay ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Opening Razorpay Gateway...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formattedAmount} via Razorpay
                  </>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground">
                Prefer direct scanning without entering details? Switch to the{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("upi_qr")}
                  className="text-primary font-bold hover:underline"
                >
                  Scan UPI QR Code
                </button>{" "}
                tab.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* QR Section */}
              <div className="flex flex-col items-center text-center">
                <div className="relative p-3.5 bg-white rounded-3xl shadow-md border-2 border-primary/20">
                  <div className="h-48 w-48 flex items-center justify-center overflow-hidden rounded-xl bg-white">
                    <img
                      src={activeQrSrc}
                      alt="Shop UPI QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-3 py-0.5 rounded-full shadow shrink-0 whitespace-nowrap">
                    Scan via Any UPI App
                  </div>
                </div>

                <div className="mt-4 w-full flex items-center justify-between rounded-xl border bg-muted/30 p-2.5 text-xs">
                  <div className="text-left font-mono truncate">
                    <span className="text-[10px] text-muted-foreground block font-sans">UPI ID (VPA):</span>
                    <strong className="text-foreground">{config.upiId}</strong>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUpi}
                    className="h-8 text-xs font-bold gap-1 shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUpi ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* UTR Reference Input Form */}
              <form onSubmit={handleSubmitUtr} className="space-y-3 pt-2 border-t">
                <div className="space-y-1">
                  <Label htmlFor="utr" className="text-xs font-bold text-foreground">
                    Enter 12-Digit UPI Ref / UTR Number after paying:
                  </Label>
                  <Input
                    id="utr"
                    placeholder="e.g. 423589102456"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="h-10 text-sm font-mono bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Available in your GPay / PhonePe / Paytm transaction receipt history.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isVerifyingUtr}
                  className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all duration-150 active:scale-[0.97]"
                >
                  {isVerifyingUtr ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Submitting UTR...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      I Have Paid — Confirm Payment
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
