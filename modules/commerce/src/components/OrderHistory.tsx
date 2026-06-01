'use client';

import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useCommerceStore, type Order } from '../stores/commerceStore';
import { cn } from '../utils/cn';

interface OrderHistoryProps {
  siteId?: string;
  userId?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-500' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
};

export function OrderHistory({ siteId, userId, className }: OrderHistoryProps) {
  const orders = useCommerceStore((s) => s.orders);
  const setOrders = useCommerceStore((s) => s.setOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams();
        if (userId) params.set('userId', userId);
        const res = await fetch(`/api/commerce/${siteId}/orders?${params}`);
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {}
      setLoading(false);
    };
    if (siteId) fetchOrders();
  }, [siteId, userId]);

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
            <div className="h-4 w-1/3 rounded bg-muted mb-2" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-2 py-12 text-muted-foreground',
          className
        )}
      >
        <Package className="size-12" />
        <p className="text-sm">No orders yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {orders.map((order) => {
        const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
        const StatusIcon = status.icon;
        return (
          <div key={order.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn('size-4', status.color)} />
                <span className={cn('text-xs font-medium', status.color)}>
                  {status.label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
