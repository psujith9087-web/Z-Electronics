"use client";

import { useState } from "react";
import { OrderStatus } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/actions/orders";
import { toast } from "sonner";

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    
    setLoading(true);
    try {
      const res = await updateOrderStatus(orderId, status);
      if (res.success) {
        toast.success(`Order #${orderId.slice(0, 8)} status updated to ${status}`);
      } else {
        toast.error(res.error || "Failed to update order status");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={status} onValueChange={(val) => setStatus(val as OrderStatus)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Pending">Pending (Processing / Review)</SelectItem>
          <SelectItem value="Completed">Completed (Fulfilled / Delivered)</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleUpdate} disabled={loading || status === currentStatus}>
        {loading ? "Updating..." : "Save Status"}
      </Button>
    </div>
  );
}
