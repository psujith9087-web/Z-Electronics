import { getCustomerSession } from "@/lib/actions/auth";
import { getMyOrders } from "@/lib/actions/orders";
import { OrderTrackerClient } from "./order-tracker-client";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Tracking & Status | Z-Electronics",
  description: "Track the real-time fulfillment status of your electronic component orders.",
};

export default async function OrdersPage() {
  const session = await getCustomerSession();
  const initialOrders = await getMyOrders(session?.phone);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 min-h-[75vh]">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Customer Dashboard
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Track Your Project Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor live component verification, dispatch progress, and access official invoices.
        </p>
      </div>

      {/* Interactive Tracker Component */}
      <OrderTrackerClient session={session} initialOrders={initialOrders} />
    </div>
  );
}

