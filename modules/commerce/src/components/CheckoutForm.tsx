'use client';

import { useState } from 'react';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useCommerceStore, type Address } from '../stores/commerceStore';
import { cn } from '../utils/cn';

const COUNTRY_OPTIONS = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'BR'];

interface CheckoutFormProps {
  siteId?: string;
  onSuccess?: (orderId: string) => void;
  className?: string;
}

export function CheckoutForm({
  siteId,
  onSuccess,
  className,
}: CheckoutFormProps) {
  const currentStep = useCommerceStore((s) => s.currentCheckoutStep);
  const shippingAddress = useCommerceStore((s) => s.shippingAddress);
  const cart = useCommerceStore((s) => s.cart);
  const setCheckoutStep = useCommerceStore((s) => s.setCheckoutStep);
  const setShippingAddress = useCommerceStore((s) => s.setShippingAddress);
  const clearCart = useCommerceStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/commerce/${siteId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          subtotal,
          tax,
          shipping,
          total,
        }),
      });
      const data = await res.json();
      clearCart();
      onSuccess?.(data.orderId);
    } catch (err) {
      console.error('Order failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'shipping' as const, label: 'Shipping', icon: Truck },
    { id: 'payment' as const, label: 'Payment', icon: CreditCard },
    { id: 'review' as const, label: 'Review', icon: CheckCircle },
  ];

  const renderField = (
    field: keyof Address,
    label: string,
    placeholder: string,
    opts?: { type?: string; className?: string }
  ) => (
    <div className={opts?.className}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type={opts?.type ?? 'text'}
        value={shippingAddress[field] as string}
        onChange={(e) => setShippingAddress({ [field]: e.target.value })}
        placeholder={placeholder}
        required
        className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs"
      />
    </div>
  );

  return (
    <div className={cn('mx-auto w-full max-w-2xl', className)}>
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <step.icon className="size-3" />
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {currentStep === 'shipping' && (
        <form
          onSubmit={handleShippingSubmit}
          className="space-y-4 rounded-lg border bg-card p-6"
        >
          <h3 className="text-sm font-medium">Shipping Address</h3>
          <div className="grid grid-cols-2 gap-3">
            {renderField('firstName', 'First Name', 'John')}
            {renderField('lastName', 'Last Name', 'Doe')}
            {renderField('email', 'Email', 'john@example.com', {
              type: 'email',
            })}
            {renderField('phone', 'Phone', '+1 (555) 000-0000', {
              type: 'tel',
            })}
          </div>
          {renderField('address1', 'Address Line 1', '123 Main St', {
            className: 'col-span-2',
          })}
          {renderField('address2', 'Address Line 2', 'Apt 4B', {
            className: 'col-span-2',
          })}
          <div className="grid grid-cols-3 gap-3">
            {renderField('city', 'City', 'New York')}
            {renderField('state', 'State', 'NY')}
            {renderField('zip', 'ZIP Code', '10001')}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Country
            </label>
            <select
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ country: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground"
          >
            Continue to Payment
          </button>
        </form>
      )}

      {currentStep === 'payment' && (
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCheckoutStep('review')}
              className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 hover:bg-accent"
            >
              <span className="text-lg font-bold">Stripe</span>
              <span className="text-xs text-muted-foreground">
                Credit / Debit Card
              </span>
            </button>
            <button
              onClick={() => setCheckoutStep('review')}
              className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 hover:bg-accent"
            >
              <span className="text-lg font-bold">PayPal</span>
              <span className="text-xs text-muted-foreground">
                PayPal account
              </span>
            </button>
          </div>
          <button
            onClick={() => setCheckoutStep('shipping')}
            className="w-full text-center text-xs text-primary hover:underline"
          >
            Back to shipping
          </button>
        </div>
      )}

      {currentStep === 'review' && (
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium">Order Review</h3>
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
          <button
            onClick={() => setCheckoutStep('payment')}
            className="w-full text-center text-xs text-primary hover:underline"
          >
            Back to payment
          </button>
        </div>
      )}
    </div>
  );
}
