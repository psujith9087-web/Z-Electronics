import { getOrderById } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  User,
  Package,
  Cpu,
  Truck,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { OrderActionButtons } from "./order-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Status Tracking | Z-Electronics",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const isCompleted = order.status === "Completed";
  const formattedDate = new Date(order.created_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const cleanPhone = order.customer_phone.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hello Sujith, I am tracking my Z-Electronics order #${order.id.slice(0, 8)} (${formatPrice(order.total_amount)}). Current status: ${order.status}. Could you provide the latest update?`
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 min-h-[80vh]">
      {/* Back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order Tracking
        </Link>
        <OrderActionButtons
          orderId={order.id}
          waText={waText}
          amount={Number(order.total_amount)}
          status={order.status}
        />
      </div>

      {/* Main Container */}
      <div className="space-y-8">
        {/* Header banner */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
                  Order Tracking
                </span>
                <Badge
                  variant={isCompleted ? "default" : "outline"}
                  className={`text-xs px-2.5 py-0.5 font-bold flex items-center gap-1.5 ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : "border-amber-500 text-amber-600 bg-amber-500/10"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 animate-pulse text-amber-600" />
                  )}
                  <span>{order.status.toUpperCase()}</span>
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono">
                #{order.id.slice(0, 10).toUpperCase()}
              </h1>
              <p className="text-xs text-muted-foreground">
                Placed on <strong className="text-foreground">{formattedDate}</strong>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-muted-foreground block font-medium">Grand Total</span>
              <span className="text-3xl font-black text-primary">
                {formatPrice(order.total_amount)}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                Cash on Delivery / Project Billing
              </span>
            </div>
          </div>

          {/* Real-time Status Message from Admin */}
          <div
            className={`rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 border ${
              isCompleted
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">
                {isCompleted
                  ? "Order Status: Fulfilled & Completed"
                  : "Order Status: Under Verification & Processing"}
              </p>
              <p className="opacity-90 leading-relaxed text-xs">
                {isCompleted
                  ? "Proprietor Sujith has verified all hardware specifications, tested components, and completed delivery."
                  : "Proprietor Sujith has acknowledged your order. Component pinouts, datasheets, and stock are currently being verified before dispatch."}
              </p>
            </div>
          </div>

          {/* Visual Fulfillment Progress Stepper */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
              Fulfillment Timeline
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {/* Step 1: Order Placed */}
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/40 border border-border/70">
                <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-2 shadow-sm">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-foreground">Order Placed</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">Recorded</span>
              </div>

              {/* Step 2: Verification */}
              <div
                className={`flex flex-col items-center text-center p-3 rounded-xl border ${
                  isCompleted
                    ? "bg-muted/40 border-border/70"
                    : "bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white animate-pulse"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                </div>
                <span className="text-xs font-bold text-foreground">Silicon Check</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {isCompleted ? "Verified" : "In Progress"}
                </span>
              </div>

              {/* Step 3: Dispatch */}
              <div
                className={`flex flex-col items-center text-center p-3 rounded-xl border ${
                  isCompleted
                    ? "bg-muted/40 border-border/70"
                    : "bg-muted/20 border-border/50 opacity-70"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm ${
                    isCompleted ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                </div>
                <span className="text-xs font-bold text-foreground">Ready / Transit</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {isCompleted ? "Dispatched" : "Pending"}
                </span>
              </div>

              {/* Step 4: Completed */}
              <div
                className={`flex flex-col items-center text-center p-3 rounded-xl border ${
                  isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20"
                    : "bg-muted/20 border-border/50 opacity-70"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm ${
                    isCompleted ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                </div>
                <span className="text-xs font-bold text-foreground">Delivered</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {isCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Proprietor Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Customer Information
            </span>
            <p className="font-bold text-foreground flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              {order.customer_name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
              <Phone className="h-4 w-4 text-emerald-500" />
              +91 {order.customer_phone}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Proprietor Contact
            </span>
            <p className="font-bold text-foreground flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Sujith (Z-Electronics)
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
              <Phone className="h-4 w-4 text-emerald-500" />
              +91 8072726924
            </p>
          </div>
        </div>

        {/* Itemized Breakdown Table */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
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
                {order.order_items && order.order_items.length > 0 ? (
                  order.order_items.map((item, idx) => {
                    const itemName =
                      item.components?.name || `Electronic Component (${item.component_id.slice(0, 8)})`;
                    const unitPrice = Number(item.price_at_purchase);
                    const subtotal = unitPrice * item.quantity;

                    return (
                      <tr key={item.id || idx} className="hover:bg-muted/10">
                        <td className="py-3 px-3 text-xs text-muted-foreground font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-semibold text-foreground">
                          <div className="flex items-center gap-2.5">
                            {item.components?.image_url ? (
                              <img
                                src={item.components.image_url}
                                alt={itemName}
                                className="h-8 w-8 rounded-lg object-cover border border-border/70 shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Cpu className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <span>{itemName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-muted-foreground">
                          {formatPrice(unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-foreground">
                          {formatPrice(subtotal)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                      Component items recorded in system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4 flex flex-col items-end gap-1.5">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST & Quality Check:</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-baseline font-bold">
                <span className="text-foreground text-sm">Total Amount:</span>
                <span className="text-xl font-black text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp & Contact CTA */}
        <div className="rounded-2xl border bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              Need Immediate Stock or Delivery Verification?
            </h4>
            <p className="text-xs text-muted-foreground">
              Proprietor Sujith is available on WhatsApp to answer questions or confirm instant local pickup.
            </p>
          </div>
          <a
            href={`https://wa.me/918072726924?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-md">
              <MessageSquare className="h-4 w-4" />
              Chat on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
