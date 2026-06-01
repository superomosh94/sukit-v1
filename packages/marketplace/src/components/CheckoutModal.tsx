'use client';

import { useState } from 'react';
import type { CheckoutSession, CheckoutItem, PaymentGateway } from '../types';

interface CheckoutModalProps {
  items: CheckoutItem[];
  session: CheckoutSession | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveItem: (moduleId: string) => void;
  onPay: (method: PaymentGateway) => Promise<void>;
  onClose: () => void;
  processing?: boolean;
}

export function CheckoutModal({
  items,
  session,
  onApplyCoupon,
  onRemoveItem,
  onPay,
  onClose,
  processing,
}: CheckoutModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentGateway>('stripe');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = session?.total ?? subtotal;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Items</h3>
            {items.map((item) => (
              <div
                key={item.moduleId}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.moduleName}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.moduleId)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Coupon</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={async () => {
                  await onApplyCoupon(couponCode);
                  setCouponApplied(true);
                }}
                disabled={!couponCode || couponApplied}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'stripe' as PaymentGateway,
                  label: 'Credit Card',
                  icon: '💳',
                },
                { id: 'paypal' as PaymentGateway, label: 'PayPal', icon: '🅿️' },
                { id: 'paddle' as PaymentGateway, label: 'Paddle', icon: '🛡️' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-3 rounded-lg border text-center transition-colors ${selectedMethod === method.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-lg">{method.icon}</span>
                  <p className="text-xs font-medium text-gray-700 mt-1">
                    {method.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {session?.discount ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">
                  -${session.discount.toFixed(2)}
                </span>
              </div>
            ) : null}
            {session?.tax ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Tax ({(session.taxRate * 100).toFixed(1)}%)
                </span>
                <span>${session.tax.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => onPay(selectedMethod)}
            disabled={processing}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            {processing
              ? 'Processing...'
              : `Pay $${total.toFixed(2)} via ${selectedMethod === 'stripe' ? 'Credit Card' : selectedMethod === 'paypal' ? 'PayPal' : 'Paddle'}`}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Secure payment processed by{' '}
            {selectedMethod === 'stripe'
              ? 'Stripe'
              : selectedMethod === 'paypal'
                ? 'PayPal'
                : 'Paddle'}
            . Your payment info is encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
