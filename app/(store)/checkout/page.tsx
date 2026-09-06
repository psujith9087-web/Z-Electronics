"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice, Order, PaymentConfig } from "@/lib/types";
import { createOrder } from "@/lib/actions/orders";
import { getCustomerSession } from "@/lib/actions/auth";
import { getPaymentConfig } from "@/lib/actions/payment";
import { OnlinePaymentGateway } from "@/components/checkout/online-payment-gateway";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Cpu,
  CheckCircle2,
  Printer,
  MessageSquare,
  Phone,
  User,
  ArrowLeft,
  Loader2,
  Clock,
  FileText,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Truck,
  Sparkles,
  MapPin,
  Check,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";

// Hydration-safe helper
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const { items, clearCart, totalPrice } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [pincode, setPincode] = useState("");
  const [projectNote, setProjectNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Online Payment Gateway Modal State
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string>("");

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    upiId: "psujith9087-1@okicici",
    payeeName: "Z-Electronics (Sujith)",
    qrImageUrl: "",
    phone: "8072726924",
    razorpayEnabled: true,
    codEnabled: true,
  });

  useEffect(() => {
    getCustomerSession().then((sess) => {
      if (sess) {
        if (sess.name) setCustomerName((prev) => prev || sess.name);
        if (sess.phone) setCustomerPhone((prev) => prev || sess.phone);
      }
    });
    getPaymentConfig().then((cfg) => {
      if (cfg) setPaymentConfig(cfg);
    });
  }, []);

  if (!isClient) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading checkout...
        </div>
      </div>
    );
  }

  // If cart is empty and no confirmed order, show prompt
  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Your project cart is empty
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Please add electronics components to your cart before proceeding to checkout.
        </p>
        <Link href="/shop">
          <Button className="font-bold shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
            Browse Components Catalog
          </Button>
        </Link>
      </div>
    );
  }

  // --- VISUAL BILL / INVOICE SCREEN ------------------------------------------
  if (confirmedOrder) {
    const isPaid =
      confirmedOrder.payment_status === "paid" ||
      confirmedOrder.status === "Completed" ||
      confirmedOrder.status === "paid";

    const invoiceDate = new Date(confirmedOrder.created_at || Date.now()).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const whatsappMessage = encodeURIComponent(
      `Hello Sujith, I have placed an order on Z-Electronics!\n\nOrder ID: #${confirmedOrder.id.slice(0, 8).toUpperCase()}\nCustomer: ${confirmedOrder.customer_name}\nPhone: ${confirmedOrder.customer_phone}\nPayment Method: ${confirmedOrder.payment_method?.toUpperCase()} (${isPaid ? "PAID" : "PENDING"})\nTotal Amount: ${formatPrice(confirmedOrder.total_amount)}\n\nPlease verify stock and confirm dispatch.`
    );

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Actions bar (hidden in print) */}
        <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="gap-2 font-semibold shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              <Printer className="h-4 w-4" />
              Print / Save Invoice (PDF)
            </Button>

            <a
              href={`https://wa.me/918072726924?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Sujith
              </Button>
            </a>
          </div>
        </div>

        {/* -- Visual Invoice Container ------------------------------------ */}
        <div className="bg-card border-2 border-border/80 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden print:border-none print:shadow-none print:p-0">
          {/* Top Status Banner */}
          {isPaid ? (
            <div className="print:hidden mb-8 flex items-center gap-3.5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 p-5 text-emerald-950 dark:text-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>
              <div className="text-sm">
                <p className="font-extrabold text-base flex items-center gap-1.5">
                  Payment Received & Order Completed! <Sparkles className="h-4 w-4 text-emerald-600" />
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  Your online payment has been verified. Transaction Reference:{" "}
                  <strong className="font-mono">{confirmedOrder.payment_id || "VERIFIED"}</strong>. Stock is reserved and preparing for dispatch.
                </p>
              </div>
            </div>
          ) : (
            <div className="print:hidden mb-8 flex items-center gap-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 p-5 text-amber-950 dark:text-amber-200 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow">
                <Truck className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <p className="font-extrabold text-base">Cash on Delivery Order Placed</p>
                <p className="text-xs opacity-90 mt-0.5">
                  Your order is booked. Please keep <strong className="font-bold">{formatPrice(confirmedOrder.total_amount)}</strong> cash ready upon component delivery. You can also pay online via UPI anytime.
                </p>
              </div>
            </div>
          )}

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b pb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-primary/40 overflow-hidden shadow bg-card shrink-0">
                  <img
                    src="/logo.png"
                    alt="Z-Electronics Logo"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-foreground block leading-none">
                    Z-<span className="text-primary">ELECTRONICS</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-extrabold text-muted-foreground mt-0.5 block">
                    PROJECT BASED ELECTRONICS & ROBOTICS
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Premier Electronic Components & Hardware Supply
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Proprietor: <span className="text-foreground font-bold">Sujith</span> | Contact:{" "}
                <span className="text-foreground font-bold">8072726924</span>
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Official Bill / Invoice
              </div>
              <p className="font-mono text-base font-bold text-foreground">
                #{confirmedOrder.id.slice(0, 10).toUpperCase()}
              </p>
              <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{invoiceDate}</span>
              </div>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid sm:grid-cols-2 gap-6 py-6 border-b text-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Billed To (Customer Details)
              </span>
              <p className="font-extrabold text-base text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {confirmedOrder.customer_name}
              </p>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                +91 {confirmedOrder.customer_phone}
              </p>
              {confirmedOrder.shipping_address?.address_line && (
                <p className="text-xs text-muted-foreground flex items-start gap-2 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    {confirmedOrder.shipping_address.address_line}, {confirmedOrder.shipping_address.city} - {confirmedOrder.shipping_address.pincode}
                  </span>
                </p>
              )}
            </div>

            <div className="sm:text-right space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Payment & Fulfillment Status
              </span>
              <div className="flex sm:justify-end items-center gap-2">
                <Badge
                  className={`text-xs px-3 py-1 font-extrabold ${
                    isPaid
                      ? "bg-emerald-600 text-white"
                      : "border-amber-500 text-amber-600 bg-amber-500/10"
                  }`}
                >
                  {isPaid ? "PAYMENT RECEIVED" : "COD PENDING"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Method: <strong className="text-foreground uppercase">{confirmedOrder.payment_method || "COD"}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Order Items Table */}
          <div className="py-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Itemized Component Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-bold uppercase text-muted-foreground">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Component Description</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {confirmedOrder.order_items && confirmedOrder.order_items.length > 0 ? (
                    confirmedOrder.order_items.map((item, index) => {
                      const itemName =
                        item.components?.name || `Electronic Component (${item.component_id.slice(0, 8)})`;
                      const unitPrice = Number(item.price_at_purchase);
                      const itemSubtotal = unitPrice * item.quantity;

                      return (
                        <tr key={item.id || index} className="hover:bg-muted/10">
                          <td className="py-3.5 px-3 text-muted-foreground font-medium text-xs">
                            {index + 1}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-foreground">
                            <span>{itemName}</span>
                          </td>
                          <td className="py-3.5 px-3 text-right text-muted-foreground">
                            {formatPrice(unitPrice)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-3 text-right font-extrabold text-foreground">
                            {formatPrice(itemSubtotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground text-xs">
                        Electronic components package
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="mt-6 border-t pt-4 flex flex-col items-end gap-1 text-sm">
              <div className="flex justify-between w-full max-w-xs text-muted-foreground">
                <span>Components Subtotal:</span>
                <span className="font-semibold text-foreground">{formatPrice(confirmedOrder.total_amount)}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-muted-foreground">
                <span>Packaging & Delivery:</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between w-full max-w-xs border-t pt-2 text-lg font-black text-foreground">
                <span>Grand Total:</span>
                <span className="text-primary">{formatPrice(confirmedOrder.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-6 border-t text-xs text-muted-foreground text-center space-y-1">
            <p className="font-bold text-foreground">
              Thank you for trusting Z-Electronics for your robotics & engineering projects!
            </p>
            <p>
              For direct inquiries, datasheets, or order changes, call or WhatsApp Sujith at <strong>8072726924</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons below invoice */}
        <div className="print:hidden mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isPaid && (
            <Button
              type="button"
              onClick={() => {
                setPendingOrderId(confirmedOrder.id);
                setIsOnlineModalOpen(true);
              }}
              className="w-full sm:w-auto h-12 px-6 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              <CreditCard className="h-4 w-4" />
              Pay Online Now via UPI / Razorpay ({formatPrice(confirmedOrder.total_amount)})
            </Button>
          )}

          <Link href={`/orders/${confirmedOrder.id}`}>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 font-bold shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Track Live Order Status →
            </Button>
          </Link>

          <Button
            onClick={() => {
              setConfirmedOrder(null);
              router.push("/shop");
            }}
            variant="ghost"
            className="w-full sm:w-auto h-12 px-6 font-semibold"
          >
            Place Another Order
          </Button>
        </div>

        {/* Online Payment Modal */}
        <OnlinePaymentGateway
          isOpen={isOnlineModalOpen}
          onClose={() => setIsOnlineModalOpen(false)}
          orderId={confirmedOrder.id}
          amount={Number(confirmedOrder.total_amount)}
          customerName={confirmedOrder.customer_name}
          customerPhone={confirmedOrder.customer_phone}
          config={paymentConfig}
          onPaymentSuccess={(paymentId) => {
            setConfirmedOrder((prev) =>
              prev
                ? {
                    ...prev,
                    status: "Completed",
                    payment_status: "paid",
                    payment_id: paymentId,
                    payment_method: "razorpay",
                  }
                : null
            );
          }}
        />
      </div>
    );
  }

  // --- CHECKOUT FORM SCREEN --------------------------------------------------
  const cartSubtotal = totalPrice();

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        payment_method: paymentMethod,
        payment_status: "pending" as const,
        shipping_address: {
          address_line: addressLine.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
          notes: projectNote.trim(),
        },
        items: items.map((item) => ({
          component_id: item.component.id,
          name: item.component.name,
          quantity: item.quantity,
          price: Number(item.component.price),
        })),
      };

      const result = await createOrder(orderData);

      if (result.success && result.data) {
        if (paymentMethod === "razorpay") {
          // Keep order data, clear cart, and open Razorpay Gateway
          clearCart();
          setPendingOrderId(result.data.id);
          setConfirmedOrder(result.data);
          setIsOnlineModalOpen(true);
          toast.success("Order recorded. Please complete payment through Razorpay / UPI.");
        } else {
          // Cash on Delivery
          clearCart();
          setConfirmedOrder(result.data);
          toast.success("Cash on Delivery order confirmed! Invoice generated.");
        }
      } else {
        toast.error(result.error || "Failed to place order. Please check your details.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error placing order";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Project Order Checkout
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Choose your payment method and enter delivery details to finalize your components order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Customer Input Form */}
        <div className="lg:col-span-7">
          <Card className="border rounded-3xl shadow-sm bg-card">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* Contact details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground border-b pb-2">
                    1. Customer Contact Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-sm font-bold text-foreground">
                      Customer / Project Lead Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customer_name"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="h-12 bg-background text-base rounded-xl"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone" className="text-sm font-bold text-foreground">
                      Mobile Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        +91
                      </span>
                      <Input
                        id="customer_phone"
                        type="tel"
                        required
                        placeholder="9876543210"
                        className="h-12 pl-14 bg-background text-base rounded-xl"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground border-b pb-2">
                    2. Shipping / Delivery Address
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold text-foreground">
                      Address / Hostel / Lab Details
                    </Label>
                    <Input
                      id="address"
                      placeholder="e.g. Room 402, Engineering Block / No. 12 Gandhi Street"
                      className="h-11 bg-background text-sm rounded-xl"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs font-bold text-foreground">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Chennai / Coimbatore"
                        className="h-10 bg-background text-sm rounded-xl"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pincode" className="text-xs font-bold text-foreground">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="e.g. 600025"
                        className="h-10 bg-background text-sm rounded-xl"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground border-b pb-2">
                    3. Select Payment Method
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Option A: Razorpay / Online UPI */}
                    <div
                      onClick={() => setPaymentMethod("razorpay")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        paymentMethod === "razorpay"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "razorpay" ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {paymentMethod === "razorpay" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-foreground flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Online Payment (Razorpay & UPI)
                          </span>
                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Pay from home using Google Pay, PhonePe, Paytm, UPI QR, Cards, or Netbanking. Verified instantly.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">GPay</span>
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">PhonePe</span>
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded">Paytm</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">Cards</span>
                        </div>
                      </div>
                    </div>

                    {/* Option B: Cash on Delivery (COD) */}
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "cod" ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-foreground flex items-center gap-2">
                            <Truck className="w-4 h-4 text-amber-600" />
                            Cash on Delivery (COD)
                          </span>
                          <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-600">
                            Pay on Arrival
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Pay cash upon receiving components at your doorstep. Admin will confirm payment and mark order completed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="project_note" className="text-xs font-bold text-foreground">
                    Project Notes / Special Instructions (Optional)
                  </Label>
                  <Input
                    id="project_note"
                    placeholder="e.g. Need breadboard compatible pins / urgent delivery"
                    className="h-11 bg-background text-sm rounded-xl"
                    value={projectNote}
                    onChange={(e) => setProjectNote(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full h-13 text-base font-extrabold shadow-lg hover:shadow-xl rounded-2xl transition-all duration-150 active:scale-[0.97] active:translate-y-0.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing Order...
                    </>
                  ) : paymentMethod === "razorpay" ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Proceed to Online Payment ({formatPrice(cartSubtotal)})
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-2" />
                      Place Cash on Delivery Order ({formatPrice(cartSubtotal)})
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Order Summary Breakdown */}
        <div className="lg:col-span-5">
          <div className="border-2 rounded-3xl bg-card p-6 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-foreground border-b pb-4 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {items.reduce((sum, i) => sum + i.quantity, 0)} Items
              </span>
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-border/60">
              {items.map(({ component, quantity }) => (
                <div key={component.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 pr-3 overflow-hidden">
                    <div className="h-9 w-9 rounded-xl border border-border/70 bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center">
                      {component.image_url ? (
                        <img
                          src={component.image_url}
                          alt={component.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Cpu className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-foreground leading-snug line-clamp-1 text-xs">
                        {component.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Qty: {quantity} × {formatPrice(component.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-foreground shrink-0 text-sm">
                    {formatPrice(Number(component.price) * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground text-xs font-medium">
                <span>Components Subtotal</span>
                <span className="font-bold text-foreground">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs font-medium">
                <span>GST & Packaging</span>
                <span className="font-bold text-emerald-600">Included (Free)</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-baseline">
                <span className="text-base font-extrabold text-foreground">Total Payable</span>
                <span className="text-2xl font-black text-primary">{formatPrice(cartSubtotal)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-2.5 font-medium">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Authentic hardware guaranteed with full replacement warranty.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
