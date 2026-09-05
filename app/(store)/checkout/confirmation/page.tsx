import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/types";

export default async function CheckoutConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const orderId = typeof resolved.order_id === "string" ? resolved.order_id : null;
  const order = orderId ? await getOrderById(orderId) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center min-h-[70vh] flex flex-col items-center justify-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-950/40 border border-emerald-500/20">
          <CheckCircle className="size-16 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-2">
        Order Confirmed!
      </h1>

      <p className="text-base text-muted-foreground mb-6 max-w-md">
        Your electronics component order has been received by Sujith and recorded in the database.
      </p>

      {order ? (
        <div className="mb-8 p-6 bg-card border rounded-2xl w-full max-w-md text-left shadow-sm space-y-3 text-sm">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Order ID</span>
            <span className="font-mono font-bold text-foreground">#{order.id.slice(0, 10).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Customer</span>
            <span className="font-semibold text-foreground">{order.customer_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Phone</span>
            <span className="font-semibold text-foreground">{order.customer_phone}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-3">
            <span className="font-bold text-foreground">Total Amount</span>
            <span className="font-black text-lg text-primary">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      ) : orderId ? (
        <div className="mb-8 p-4 bg-muted/40 border rounded-xl w-full max-w-md">
          <p className="text-xs text-muted-foreground mb-1">Order Reference</p>
          <p className="font-mono text-lg font-bold">{orderId}</p>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button size="lg" className="h-11 px-6 gap-2 font-semibold">
            <ShoppingBag className="size-4" />
            Continue Shopping
          </Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline" size="lg" className="h-11 px-6 gap-2">
            <ArrowLeft className="size-4" />
            Back to Cart
          </Button>
        </Link>
      </div>
    </div>
  );
}
