import { getOrderById } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, MessageSquare, ExternalLink, Cpu, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusUpdater } from "./order-status-updater";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Order Detail | Z-Electronics",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const isCompleted = order.status === "Completed";
  const cleanPhone = order.customer_phone.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hello ${order.customer_name}, this is Sujith from Z-Electronics regarding your order #${order.id.slice(0, 8)} (${formatPrice(order.total_amount)}). Current status: ${order.status}.`
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
              Order #{order.id.slice(0, 10).toUpperCase()}
            </h1>
            <p className="text-muted-foreground text-xs">
              Placed on {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/orders/${order.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              View Customer Page
            </Button>
          </Link>
          <Badge
            variant={isCompleted ? "default" : "outline"}
            className={`text-xs px-3 py-1 font-bold ${
              isCompleted
                ? "bg-emerald-600 text-white"
                : "border-amber-500 text-amber-600 bg-amber-500/10"
            }`}
          >
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Status Updater */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Order Items Table */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Itemized Components</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="py-3 px-4 text-xs">Component</TableHead>
                    <TableHead className="py-3 px-4 text-right text-xs">Unit Price</TableHead>
                    <TableHead className="py-3 px-4 text-center text-xs">Qty</TableHead>
                    <TableHead className="py-3 px-4 text-right text-xs">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item, idx) => {
                      const itemName =
                        item.components?.name || `Electronic Component (${item.component_id.slice(0, 8)})`;
                      const unitPrice = Number(item.price_at_purchase);
                      const subtotal = unitPrice * item.quantity;

                      return (
                        <TableRow key={item.id || idx}>
                          <TableCell className="py-3.5 px-4 font-semibold text-sm">
                            <div className="flex items-center gap-2.5">
                              {item.components?.image_url ? (
                                <img
                                  src={item.components.image_url}
                                  alt={itemName}
                                  className="h-8 w-8 rounded-lg object-cover border shrink-0"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <Cpu className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <span>{itemName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-right text-muted-foreground text-xs">
                            {formatPrice(unitPrice)}
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-center font-bold text-xs">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-right font-bold text-sm">
                            {formatPrice(subtotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                        No items recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="p-4 border-t flex justify-between items-center text-sm">
                <span className="font-semibold text-muted-foreground">Total Amount:</span>
                <span className="text-xl font-black text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status Updater Card */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Update Fulfillment Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Changes save directly to Supabase and immediately reflect on the customer's tracking screen.
                </p>
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Customer Info & Actions */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Customer Name</p>
                <p className="font-bold text-base text-foreground mt-0.5">{order.customer_name}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Mobile Phone</p>
                <p className="font-mono text-sm font-bold text-foreground mt-0.5">
                  +91 {order.customer_phone}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp Customer
                  </Button>
                </a>

                <a href={`tel:${cleanPhone}`} className="w-full">
                  <Button variant="outline" className="w-full gap-2 text-xs font-semibold h-10">
                    <Phone className="h-4 w-4 text-primary" />
                    Call +91 {cleanPhone}
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

