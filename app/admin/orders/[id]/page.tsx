import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, MapPin, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusUpdater } from "./order-status-updater";
import Image from "next/image";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      profiles(email, full_name, phone),
      order_items(
        *,
        products(name, images)
      )
    `)
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      case 'pending': return 'outline';
      case 'paid': return 'secondary';
      case 'shipped': return 'secondary';
      default: return 'secondary';
    }
  };

  const address = order.shipping_address;
  const customerEmail = order.profiles?.email || order.guest_email;
  const customerPhone = order.profiles?.phone || order.guest_phone || address?.phone;
  const customerName = order.profiles?.full_name || address?.full_name || "Guest User";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/orders" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground text-sm">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Badge variant={getStatusBadge(order.status) as any} className="text-sm px-3 py-1">
            {order.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.products?.images?.[0] ? (
                            <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                              <Image 
                                src={item.products.images[0]} 
                                alt={item.product_name_snapshot} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No img</span>
                            </div>
                          )}
                          <div className="font-medium">{item.product_name_snapshot}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(Number(item.price_snapshot))}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(Number(item.subtotal))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-3 text-sm">
                  <div className="flex justify-between font-medium text-lg pt-4 border-t">
                    <span>Total Amount</span>
                    <span>{formatPrice(Number(order.total_amount))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  <a href={`mailto:${customerEmail}`} className="text-blue-600 hover:underline">
                    {customerEmail}
                  </a>
                </p>
              </div>
              {customerPhone && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{customerPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {address ? (
                <>
                  <p className="font-medium text-foreground">{address.full_name}</p>
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </>
              ) : (
                <p>No shipping address provided.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
