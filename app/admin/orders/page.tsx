import { getAllOrders } from "@/lib/actions/orders";
import { OrdersClient } from "../orders-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Orders Management | Z-Electronics",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <OrdersClient initialOrders={orders} />
    </div>
  );
}

