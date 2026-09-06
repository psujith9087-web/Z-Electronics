"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice, Order } from "@/lib/types";
import { createOrder } from "@/lib/actions/orders";
import { getCustomerSession } from "@/lib/actions/auth";
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
} from "lucide-react";

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
  const [projectNote, setProjectNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getCustomerSession().then((sess) => {
      if (sess) {
        if (sess.name) setCustomerName((prev) => prev || sess.name);
        if (sess.phone) setCustomerPhone((prev) => prev || sess.phone);
      }
    });
  }, []);

  if (!isClient) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading checkout...</div>
      </div>
    );
  }

  // If cart is empty and no confirmed order, show prompt to add components
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
          Please add components to your cart before proceeding to checkout.
        </p>
        <Link href="/">
          <Button>Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  // --- VISUAL BILL / INVOICE SCREEN ------------------------------------------
  if (confirmedOrder) {
    const invoiceDate = new Date(confirmedOrder.created_at || Date.now()).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const whatsappMessage = encodeURIComponent(
      `Hello Sujith, I have placed an order on Z-Electronics!\n\nOrder ID: ${confirmedOrder.id}\nCustomer: ${confirmedOrder.customer_name}\nPhone: ${confirmedOrder.customer_phone}\nTotal Amount: ${formatPrice(confirmedOrder.total_amount)}\n\nPlease verify stock and confirm dispatch.`
    );

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Actions bar (hidden in print) */}
        <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="gap-2 font-semibold"
            >
              <Printer className="h-4 w-4" />
              Print / Save Invoice (PDF)
            </Button>

            <a
              href={`https://wa.me/918072726924?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Sujith (8072726924)
              </Button>
            </a>
          </div>
        </div>

        {/* -- Visual Invoice Container ------------------------------------ */}
        <div className="bg-card border-2 border-border/80 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden print:border-none print:shadow-none print:p-0">
          {/* Top Success Banner (hidden in print) */}
          <div className="print:hidden mb-8 flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Order Received & Visual Invoice Generated!</p>
              <p className="text-xs opacity-90">
                Your order has been recorded in the Supabase database. Review your invoice below or notify owner Sujith.
              </p>
            </div>
          </div>

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b pb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-amber-500/40 overflow-hidden shadow-md bg-card shrink-0">
                  <img
                    src="/logo.png"
                    alt="Z-Electronics Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-foreground block leading-none">
                    Z-<span className="text-primary">ELECTRONICS</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground mt-0.5 block">
                    PROJECT BASED ELECTRONICS
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Premier Electronic Components & Hardware Supply
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Proprietor: <span className="text-foreground font-semibold">Sujith</span> | Contact:{" "}
                <span className="text-foreground font-semibold">8072726924</span>
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Official Bill / Invoice
              </div>
              <p className="font-mono text-sm font-bold text-foreground">
                Invoice #{confirmedOrder.id.slice(0, 10).toUpperCase()}
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
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Billed To (Customer Details)
              </span>
              <p className="font-bold text-base text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {confirmedOrder.customer_name}
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                {confirmedOrder.customer_phone}
              </p>
            </div>

            <div className="sm:text-right space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Order Status & Fulfillment
              </span>
              <div>
                <Badge
                  variant={confirmedOrder.status === "Completed" ? "default" : "outline"}
                  className={`text-xs px-3 py-1 font-bold ${
                    confirmedOrder.status === "Pending"
                      ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {confirmedOrder.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment: <strong className="text-foreground">Cash on Delivery / Project Billing</strong>
              </p>
            </div>
          </div>

          {/* Itemized Order Items Table */}
          <div className="py-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
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
                            <div className="flex items-center gap-2.5">
                              {item.components?.image_url ? (
                                <img
                                  src={item.components.image_url}
                                  alt={itemName}
                                  className="h-7 w-7 rounded-lg object-cover border border-border/70 shrink-0"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : null}
                              <span>{itemName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right text-muted-foreground">
                            {formatPrice(unitPrice)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-foreground">
                            {formatPrice(itemSubtotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground">
                        Components loaded for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="mt-6 border-t pt-4 flex flex-col items-end gap-2">
              <div className="w-full sm:w-72 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(confirmedOrder.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes & GST:</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-baseline text-base font-bold">
                  <span className="text-foreground">Grand Total:</span>
                  <span className="text-2xl font-black text-primary">
                    {formatPrice(confirmedOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note & Signature */}
          <div className="mt-8 border-t border-dashed pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Important Note:</p>
              <p>Please inspect components upon receipt. For technical datasheet queries, contact Sujith.</p>
            </div>
            <div className="sm:text-right">
              <p className="font-semibold text-foreground">Authorized Signatory</p>
              <p className="text-primary font-bold">Z-Electronics (Sujith)</p>
            </div>
          </div>
        </div>

        {/* Post-order buttons (hidden in print) */}
        <div className="print:hidden mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => {
              setConfirmedOrder(null);
              router.push("/");
            }}
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 font-semibold"
          >
            Place Another Order
          </Button>

          <a
            href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto h-11 px-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <MessageSquare className="h-4 w-4" />
              Join WhatsApp Community
            </Button>
          </a>
        </div>
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
        items: items.map((item) => ({
          component_id: item.component.id,
          name: item.component.name,
          quantity: item.quantity,
          price: Number(item.component.price),
        })),
      };

      const result = await createOrder(orderData);

      if (result.success && result.data) {
        toast.success("Order placed successfully! Generating your invoice...");
        clearCart();
        setConfirmedOrder(result.data);
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Project Order Checkout
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your name and contact number to confirm your order and generate your official bill.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Customer Input Form */}
        <div className="lg:col-span-7">
          <Card className="border rounded-2xl shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-sm font-semibold text-foreground">
                    Customer / Project Lead Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="h-12 bg-background text-base"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will appear on your generated bill/invoice.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_phone" className="text-sm font-semibold text-foreground">
                    Mobile Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="customer_phone"
                      type="tel"
                      required
                      placeholder="9876543210"
                      className="h-12 pl-14 bg-background text-base"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Owner Sujith uses this to confirm dispatch and WhatsApp updates.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_note" className="text-sm font-semibold text-foreground">
                    Project Notes / Special Instructions (Optional)
                  </Label>
                  <Input
                    id="project_note"
                    placeholder="e.g. Need breadboard compatible pins / urgent delivery"
                    className="h-12 bg-background text-sm"
                    value={projectNote}
                    onChange={(e) => setProjectNote(e.target.value)}
                  />
                </div>

                <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Direct Supply Verification</span>
                  </div>
                  <p>
                    Upon clicking <strong>Generate Bill & Place Order</strong>, your order will be pushed to the Supabase database and an official on-screen visual invoice will be rendered immediately.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full h-13 text-base font-bold shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating Bill & Submitting Order...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Generate Bill & Place Order ({formatPrice(cartSubtotal)})
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Order Summary Breakdown */}
        <div className="lg:col-span-5">
          <div className="border rounded-2xl bg-card p-6 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-foreground border-b pb-4 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-muted-foreground">
                {items.reduce((sum, i) => sum + i.quantity, 0)} Items
              </span>
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-border/60">
              {items.map(({ component, quantity }) => (
                <div key={component.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 pr-3 overflow-hidden">
                    <div className="h-9 w-9 rounded-lg border border-border/70 bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center">
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
                      <p className="font-semibold text-foreground leading-snug line-clamp-1">
                        {component.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {quantity} × {formatPrice(component.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground shrink-0">
                    {formatPrice(Number(component.price) * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & GST</span>
                <span className="font-medium text-emerald-600">Included</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-baseline font-bold">
                <span className="text-base text-foreground">Total</span>
                <span className="text-2xl font-black text-primary">{formatPrice(cartSubtotal)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Instant Invoice with printable PDF will be shown right after submission.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
