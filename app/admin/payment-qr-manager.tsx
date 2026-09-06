"use client";

import { useState, useRef } from "react";
import { PaymentConfig, updatePaymentConfig } from "@/lib/actions/payment";
import { compressImageFile } from "@/lib/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, UploadCloud, CheckCircle2, RotateCcw, Loader2, Copy, ExternalLink, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface PaymentQrManagerProps {
  initialConfig: PaymentConfig;
}

export function PaymentQrManager({ initialConfig }: PaymentQrManagerProps) {
  const [config, setConfig] = useState<PaymentConfig>(initialConfig);
  const [upiId, setUpiId] = useState(initialConfig.upiId || "8072726924@upi");
  const [payeeName, setPayeeName] = useState(initialConfig.payeeName || "Z-Electronics (Sujith)");
  const [phone, setPhone] = useState(initialConfig.phone || "8072726924");
  const [note, setNote] = useState(initialConfig.note || "Scan to pay using Google Pay, PhonePe, Paytm, or any UPI app");
  const [qrImageUrl, setQrImageUrl] = useState(initialConfig.qrImageUrl || "");
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
      });

      if (res.success && res.data) {
        setConfig(res.data);
        toast.success("Payment QR settings saved successfully! Customer portal updated.");
      } else {
        toast.error(res.error || "Failed to update payment settings.");
      }
    } catch {
      toast.error("Error saving payment settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied to clipboard!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          UPI Payment QR Manager
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload your own personal UPI / Google Pay / PhonePe QR code photo. Customers will view and scan this code in their portal to pay for orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Form */}
        <div className="md:col-span-7">
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Payment Credentials</CardTitle>
              <CardDescription className="text-xs">
                Configure your shop's official payment receiving details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                {/* QR Code Upload Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Your Payment QR Code Photo</Label>
                    {qrImageUrl && (
                      <button
                        type="button"
                        onClick={() => setQrImageUrl("")}
                        className="text-[11px] text-destructive hover:underline font-semibold flex items-center gap-1"
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
                        <p className="text-[11px] text-muted-foreground">
                          Customers will scan your personal payment QR image directly at checkout.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="h-7 text-xs gap-1.5 rounded-lg font-semibold"
                        >
                          <UploadCloud className="h-3.5 w-3.5" />
                          {isUploading ? "Compressing..." : "Change QR Photo"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <UploadCloud className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Click to upload your UPI QR code from Files App
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Supports GPay, PhonePe, Paytm, or BHIM QR screenshots (JPG, PNG)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* UPI ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="upi-id" className="text-xs font-semibold">
                    UPI ID (VPA) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="upi-id"
                      required
                      placeholder="e.g. 8072726924@upi"
                      className="font-mono text-xs pr-10"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
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
                  <p className="text-[11px] text-muted-foreground">
                    Customers can copy this UPI ID to pay manually via GPay/PhonePe.
                  </p>
                </div>

                {/* Payee Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="payee-name" className="text-xs font-semibold">
                    Payee / Shop Name
                  </Label>
                  <Input
                    id="payee-name"
                    placeholder="e.g. Z-Electronics (Sujith)"
                    className="text-xs"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="pay-phone" className="text-xs font-semibold">
                    Payment Verification WhatsApp / Phone
                  </Label>
                  <Input
                    id="pay-phone"
                    placeholder="8072726924"
                    className="text-xs"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Customer Note */}
                <div className="space-y-1.5">
                  <Label htmlFor="pay-note" className="text-xs font-semibold">
                    Instructions for Customer
                  </Label>
                  <Textarea
                    id="pay-note"
                    rows={2}
                    placeholder="Scan to pay using Google Pay, PhonePe, Paytm..."
                    className="text-xs"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={isSaving} className="w-full font-bold text-xs h-10 shadow-sm">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Saving Settings...
                      </>
                    ) : (
                      "Save Payment QR & UPI Settings"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Live Customer Portal Preview */}
        <div className="md:col-span-5">
          <Card className="rounded-2xl border bg-card/60 shadow-sm overflow-hidden sticky top-24">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b">
              <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Customer Portal Live Preview
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                This is exactly how the customer will see and scan your QR code.
              </p>
            </div>

            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-border/60">
                <img
                  src={activeQrSrc}
                  alt="QR Code Preview"
                  className="h-52 w-52 object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to dynamic qr server if user image fails
                    (e.currentTarget as HTMLImageElement).src = dynamicQrUrl;
                  }}
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground">{payeeName}</h4>
                <div className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full text-xs font-mono text-foreground font-semibold">
                  <span>{upiId}</span>
                  <button type="button" onClick={copyUpi} className="hover:text-primary">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 max-w-xs leading-relaxed">
                  {note}
                </p>
              </div>

              <div className="w-full pt-2 border-t text-left text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Accepted Apps:</span>
                  <span className="font-semibold text-foreground">GPay, PhonePe, Paytm, BHIM</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment WhatsApp:</span>
                  <span className="font-semibold text-foreground">+91 {phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
