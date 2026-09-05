import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/lib/actions/orders";
import Link from "next/link";
import { formatPrice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Package, Eye, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/orders");
  }

  const orders = await getMyOrders();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 min-h-[70vh]">
      <div className="flex items-center gap-3 mb-8">
        <Package className="size-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed">
          <PackageX className="size-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't placed any orders with us yet.
          </p>
          <Button render={<Link href="/shop" />}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {order.id.slice(0, 8).toUpperCase()}...
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" render={<Link href={`/orders/${order.id}`} />} className="gap-2">
                        <Eye className="size-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
