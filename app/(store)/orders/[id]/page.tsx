import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, CreditCard, Package } from "lucide-react";

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'paid': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'shipped': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
    case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?redirect=/orders/${id}`);
  }

  // Fetch order with items
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shipping_address as any;
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: 'numeric'
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 inline-flex">
          <ArrowLeft className="size-4" />
          Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order Details</h1>
          <p className="text-muted-foreground text-sm font-mono flex items-center gap-2">
            ID: {order.id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-2">{date}</p>
          <Badge variant="outline" className={`capitalize px-3 py-1 text-sm ${getStatusColor(order.status)}`}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border rounded-xl p-6 bg-card col-span-1 md:col-span-2 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="size-5 text-muted-foreground" />
            Items Ordered
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="pb-3 font-medium text-left">Product</th>
                  <th className="pb-3 font-medium text-center">Price</th>
                  <th className="pb-3 font-medium text-center">Qty</th>
                  <th className="pb-3 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.order_items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-4 font-medium">{item.product_name_snapshot}</td>
                    <td className="py-4 text-center text-muted-foreground">{formatPrice(item.price_snapshot)}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right font-medium">{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 pt-4 border-t flex justify-between items-center text-lg">
            <span className="font-bold">Total Amount</span>
            <span className="font-bold text-xl">{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border rounded-xl p-6 bg-card shadow-sm">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <MapPin className="size-4" />
              Shipping Address
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-base mb-1">{shippingAddress.full_name}</p>
              {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
              <p className="text-muted-foreground mt-2">{shippingAddress.address_line1}</p>
              {shippingAddress.address_line2 && <p className="text-muted-foreground">{shippingAddress.address_line2}</p>}
              <p className="text-muted-foreground">
                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
              </p>
            </div>
          </div>

          <div className="border rounded-xl p-6 bg-card shadow-sm">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <CreditCard className="size-4" />
              Payment Method
            </h2>
            <p className="font-medium">
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
