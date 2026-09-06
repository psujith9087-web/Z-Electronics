"use client";

import { useState } from "react";
import { Order, OrderStatus, formatPrice } from "@/lib/types";
import { updateOrderStatus, deleteOrder, resetAllOrders } from "@/lib/actions/orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Phone, MessageSquare, Eye, CheckCircle2, Clock, Package, Loader2, ExternalLink, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrdersClientProps {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // View items modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Reset All Orders Dialog state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Delete Single Order Dialog state
  const [isSingleDeleteOpen, setIsSingleDeleteOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    return true;
  });

  const handleStatusToggle = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus: OrderStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    setUpdatingId(orderId);

    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        toast.success(`Order #${orderId.slice(0, 8)} marked as ${nextStatus}!`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      } else {
        toast.error(res.error || "Failed to update order status.");
      }
    } catch {
      toast.error("Error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetAllOrders = async () => {
    setIsResetting(true);
    try {
      const res = await resetAllOrders();
      if (res.success) {
        setOrders([]);
        setIsResetOpen(false);
        toast.success("All previous orders have been cleared. You are ready to start fresh!");
      } else {
        toast.error(res.error || "Failed to reset orders.");
      }
    } catch {
      toast.error("Error resetting orders.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteSingleOrder = async () => {
    if (!deletingOrderId) return;
    setIsDeletingSingle(true);
    try {
      const res = await deleteOrder(deletingOrderId);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== deletingOrderId));
        setIsSingleDeleteOpen(false);
        setDeletingOrderId(null);
        toast.success("Order removed from system.");
      } else {
        toast.error(res.error || "Failed to delete order.");
      }
    } catch {
      toast.error("Error deleting order.");
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Customer Project Orders
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor incoming electronics orders, view component breakdowns, and update fulfillment status.
          </p>
        </div>

        {/* Quick status filter buttons & Reset Button */}
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Pending", "Completed"] as const).map((st) => {
            const count = st === "All" ? orders.length : orders.filter((o) => o.status === st).length;
            return (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className="text-xs h-8 px-3 rounded-lg"
              >
                {st} ({count})
              </Button>
            );
          })}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsResetOpen(true)}
            className="text-xs h-8 px-3 rounded-lg gap-1.5 font-bold shadow-sm bg-red-600 hover:bg-red-700 text-white"
            title="Clear all previous orders and start fresh"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Orders
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, phone, or order ID..."
            className="pl-9 h-10 bg-background text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <tr className="border-b bg-muted/40 text-xs font-bold text-muted-foreground">
              <TableHead className="py-3.5 px-4">Order ID & Date</TableHead>
              <TableHead className="py-3.5 px-4">Customer Details</TableHead>
              <TableHead className="py-3.5 px-4 text-right">Total Amount</TableHead>
              <TableHead className="py-3.5 px-4 text-center">Status</TableHead>
              <TableHead className="py-3.5 px-4 text-center">Toggle Status</TableHead>
              <TableHead className="py-3.5 px-4 text-right">Actions</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filteredOrders.map((order) => {
              const isUpdating = updatingId === order.id;
              const formattedDate = new Date(order.created_at).toLocaleString("en-IN", {
                dateStyle: "short",
                timeStyle: "short",
              });

              const cleanPhone = order.customer_phone.replace(/\D/g, "");
              const waText = encodeURIComponent(
                `Hello ${order.customer_name}, this is Sujith from Z-Electronics regarding your order #${order.id.slice(0, 8)} for ${formatPrice(order.total_amount)}.`
              );

              return (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4 px-4">
                    <span className="font-mono font-bold text-foreground text-xs block">
                      #{order.id.slice(0, 10).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{formattedDate}</span>
                  </TableCell>

                  <TableCell className="py-4 px-4">
                    <span className="font-bold text-foreground text-sm block">
                      {order.customer_name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        title="Call Customer"
                      >
                        <Phone className="h-3 w-3" />
                        {order.customer_phone}
                      </a>
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded"
                        title="Message on WhatsApp"
                      >
                        <MessageSquare className="h-3 w-3" />
                        WhatsApp
                      </a>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-4 text-right font-bold text-foreground text-sm">
                    {formatPrice(order.total_amount)}
                  </TableCell>

                  <TableCell className="py-4 px-4 text-center">
                    <Badge
                      variant={order.status === "Completed" ? "default" : "outline"}
                      className={`text-[11px] font-bold ${
                        order.status === "Pending"
                          ? "border-amber-500 text-amber-600 bg-amber-500/10"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => handleStatusToggle(order.id, order.status)}
                      className={`h-8 text-xs font-semibold ${
                        order.status === "Pending"
                          ? "hover:bg-emerald-600 hover:text-white"
                          : "hover:bg-amber-600 hover:text-white"
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : order.status === "Pending" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                          Mark Completed
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1 text-amber-600" />
                          Revert to Pending
                        </>
                      )}
                    </Button>
                  </TableCell>

                  <TableCell className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/orders/${order.id}`} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-[11px] font-semibold"
                          title="View live customer tracking page"
                        >
                          <ExternalLink className="h-3 w-3 text-primary" />
                          Track
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Items
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingOrderId(order.id);
                          setIsSingleDeleteOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete order"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No customer orders match the current filter.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* -- ORDER ITEMS BREAKDOWN DIALOG ------------------------------------ */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(0, 10).toUpperCase()}</DialogTitle>
            <DialogDescription className="text-xs">
              Ordered by {selectedOrder?.customer_name} ({selectedOrder?.customer_phone})
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="border rounded-xl overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Component</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      selectedOrder.order_items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            {item.components?.name || `Component (${item.component_id.slice(0, 8)})`}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">
                            {formatPrice(Number(item.price_at_purchase))}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                            {formatPrice(Number(item.price_at_purchase) * item.quantity)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground text-xs">
                          No items recorded for this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center px-1 text-sm">
                <span className="text-muted-foreground font-medium">Order Total:</span>
                <span className="text-xl font-black text-primary">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* -- RESET ALL ORDERS CONFIRMATION DIALOG ------------------------ */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-1">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-lg">Reset All Orders & Start Fresh?</DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed pt-2">
              This action will permanently delete <strong>all previous and test orders</strong> and their line items from the database. 
              <br /><br />
              Use this option when you want a completely clean slate for new incoming customer orders. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleResetAllOrders}
              disabled={isResetting}
              className="gap-1.5 font-semibold bg-red-600 hover:bg-red-700"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Resetting Database...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Yes, Reset & Delete All Orders
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -- SINGLE ORDER DELETION DIALOG ---------------------------------- */}
      <Dialog open={isSingleDeleteOpen} onOpenChange={setIsSingleDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Order?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete order #{deletingOrderId?.slice(0, 10).toUpperCase()}? This will remove this order permanently.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSingleDeleteOpen(false)}
              disabled={isDeletingSingle}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSingleOrder}
              disabled={isDeletingSingle}
              className="gap-1.5 font-semibold bg-red-600 hover:bg-red-700"
            >
              {isDeletingSingle ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
