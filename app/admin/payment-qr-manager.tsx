"use client";

import { useState, useRef } from "react";
import { updatePaymentConfig } from "@/lib/actions/payment";
import { PaymentConfig } from "@/lib/types";
import { compressImageFile } from "@/lib/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  X,
  CreditCard,
  Lock,
  Truck,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentQrManagerProps {
  initialConfig: PaymentConfig;
}

export function PaymentQrManager({ initialConfig }: PaymentQrManagerProps) {
  const [config, setConfig] = useState<PaymentConfig>(initialConfig);
  const [upiId, setUpiId] = useState(initialConfig.upiId || "psujith9087-1@okicici");
  const [payeeName, setPayeeName] = useState(initialConfig.payeeName || "Z-Electronics (Sujith)");
  const [phone, setPhone] = useState(initialConfig.phone || "8072726924");
  const [note, setNote] = useState(initialConfig.note || "Scan to pay using Google Pay, PhonePe, Paytm, or any UPI app");
  const [qrImageUrl, setQrImageUrl] = useState(initialConfig.qrImageUrl || "");

  // Razorpay Gateway Config
  const [razorpayKeyId, setRazorpayKeyId] = useState(initialConfig.razorpayKeyId || "");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(initialConfig.razorpayKeySecret || "");
  const [razorpayEnabled, setRazorpayEnabled] = useState(initialConfig.razorpayEnabled !== false);
  const [codEnabled, setCodEnabled] = useState(initialConfig.codEnabled !== false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic fallback QR url if no custom image is uploaded
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR`
  )}`;

  const activeQrSrc = qrImageUrl || dynamicQrUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await compressImageFile(file);
      setQrImageUrl(base64);
      toast.success("Payment QR code loaded from your device files!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load QR code image.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim()) {
      toast.error("UPI ID is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updatePaymentConfig({
        upiId: upiId.trim(),
        payeeName: payeeName.trim(),
        phone: phone.trim(),
        note: note.trim(),
        qrImageUrl: qrImageUrl.trim(),
        razorpayKeyId: razorpayKeyId.trim(),
        razorpayKeySecret: razorpayKeySecret.trim(),
        razorpayEnabled,
        codEnabled,
      });

      if (res.success && res.data) {
        setConfig(res.data);
        toast.success("Payment & Gateway settings saved successfully in database!");
      } else {
        toast.error(res.error || "Failed to update payment settings.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving payment settings.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied to clipboard!");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Gateway & UPI QR Settings
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure Razorpay Online Payment Gateway (UPI, GPay, PhonePe, Cards) and upload your personal UPI QR code. Stored directly in Supabase Database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Razorpay Gateway Box */}
            <Card className="rounded-2xl border-2 border-primary/20 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Razorpay Online Payment Gateway
                  </CardTitle>
                  <Badge className={razorpayEnabled ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}>
                    {razorpayEnabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Accepts Google Pay, PhonePe, Paytm, BHIM, Cards (Visa, Mastercard, RuPay), and Netbanking with real-time signature verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs font-semibold">
                  <span>Enable Razorpay Online Payments</span>
                  <input
                    type="checkbox"
                    checked={razorpayEnabled}
                    onChange={(e) => setRazorpayEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Razorpay Key ID</Label>
                  <Input
                    placeholder="rzp_live_... or rzp_test_..."
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    className="h-10 text-xs font-mono bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Obtained from your Razorpay Dashboard &gt; Settings &gt; API Keys.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Razorpay Key Secret</Label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    className="h-10 text-xs font-mono bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Required for cryptographically verifying HMAC SHA256 payment signatures.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* UPI & QR Code Settings */}
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-emerald-600" />
                    Personal UPI & Direct QR Settings
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Your official UPI handle and custom QR photo shown to customers who prefer scanning directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Upload Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold">Your Payment QR Code Photo</Label>
                    {qrImageUrl && (
                      <button
                        type="button"
                        onClick={() => setQrImageUrl("")}
                        className="text-[11px] text-destructive hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3 w-3" /> Remove Custom QR
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {qrImageUrl ? (
                    <div className="rounded-2xl border-2 border-primary/40 bg-muted/20 p-4 flex items-center gap-4">
                      <div className="h-24 w-24 rounded-xl overflow-hidden border bg-white p-1 shrink-0 shadow-sm flex items-center justify-center">
                        <img
                          src={qrImageUrl}
                          alt="Custom UPI QR"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Custom QR Loaded</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          Customers will scan your personal payment QR image directly at checkout.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-7 text-xs font-semibold gap-1"
                        >
                          <UploadCloud className="h-3 w-3" /> Change QR Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/10 hover:bg-muted/20 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-foreground">
                        Click or browse to upload your Payment QR photo
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Screenshot or photo of your Google Pay / PhonePe / Paytm / BHIM QR
                      </p>
                    </div>
                  )}
                </div>

                {/* UPI ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="upi_id" className="text-xs font-bold">UPI ID (VPA) *</Label>
                  <div className="relative">
                    <Input
                      id="upi_id"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. psujith9087-1@okicici"
                      className="h-10 text-xs font-mono bg-background"
                    />
                    <button
                      type="button"
                      onClick={copyUpi}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      title="Copy UPI ID"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Payee Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="payee_name" className="text-xs font-bold">Payee / Shop Name</Label>
                  <Input
                    id="payee_name"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. Z-Electronics (Sujith)"
                    className="h-10 text-xs bg-background"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold">Payment Verification WhatsApp / Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 8072726924"
                    className="h-10 text-xs font-mono bg-background"
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <Label htmlFor="note" className="text-xs font-bold">Instructions for Customer</Label>
                  <Textarea
                    id="note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="text-xs bg-background resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isSaving}
              size="lg"
              className="w-full h-12 text-sm font-extrabold shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Settings to Database...
                </>
              ) : (
                "Save Payment & Gateway Settings"
              )}
            </Button>
          </form>
        </div>

        {/* Right Side: Live Customer Portal Preview */}
        <div className="lg:col-span-5">
          <Card className="rounded-3xl border-2 border-border/80 bg-card shadow-sm sticky top-24 overflow-hidden">
            <CardHeader className="bg-muted/40 border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Customer Portal Live Preview
                </CardTitle>
              </div>
              <p className="text-[11px] text-muted-foreground">
                This is exactly how the customer will see and scan your QR code at checkout.
              </p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow border-2 border-primary/20">
                <div className="h-44 w-44 flex items-center justify-center overflow-hidden rounded-xl bg-white">
                  <img
                    src={activeQrSrc}
                    alt="Customer QR Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-1 w-full">
                <p className="font-extrabold text-sm text-foreground">{payeeName}</p>
                <div className="inline-flex items-center gap-1 text-xs font-mono bg-muted px-2.5 py-1 rounded-lg">
                  <span>{upiId}</span>
                  <Copy className="h-3 w-3 text-muted-foreground cursor-pointer" onClick={copyUpi} />
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">{note}</p>
              </div>

              <div className="w-full border-t pt-3 text-[11px] text-muted-foreground space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Accepted Apps:</span>
                  <strong className="text-foreground">GPay, PhonePe, Paytm, BHIM</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment WhatsApp:</span>
                  <strong className="text-foreground">+91 {phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Online Gateway:</span>
                  <strong className={razorpayEnabled ? "text-emerald-600" : "text-muted-foreground"}>
                    {razorpayEnabled ? "Razorpay Active" : "Disabled"}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
