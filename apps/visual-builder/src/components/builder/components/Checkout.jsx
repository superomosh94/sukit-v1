import React, { useState } from 'react';
import { CreditCard, Truck, Shield, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Checkout = ({ 
    items = [],
    onSubmit,
    className 
}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', state: '', zipCode: '', country: 'US',
        cardNumber: '', expiry: '', cvc: '', nameOnCard: ''
    });

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            onSubmit?.(formData);
        }
    };

    return (
        <div className={cn('grid md:grid-cols-3 gap-6', className)}>
            {/* Checkout Form */}
            <div className="md:col-span-2">
                <div className="bg-surface border border-border rounded-lg p-6">
                    {/* Steps */}
                    <div className="flex items-center justify-between mb-6">
                        {[
                            { number: 1, label: 'Information', icon: Truck },
                            { number: 2, label: 'Shipping', icon: Shield },
                            { number: 3, label: 'Payment', icon: CreditCard }
                        ].map((s) => (
                            <div key={s.number} className="flex items-center">
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center',
                                    step >= s.number ? 'bg-primary-500 text-white' : 'bg-surface-light text-text-secondary'
                                )}>
                                    {s.number}
                                </div>
                                <span className="ml-2 text-sm text-text-primary hidden sm:inline">{s.label}</span>
                                {s.number < 3 && <ChevronRight className="w-4 h-4 text-text-secondary mx-4" />}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-text-primary">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg" required />
                                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg" required />
                                </div>
                                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-surface border border-border rounded-lg" required />
                                <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-surface border border-border rounded-lg" required />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-text-primary">Shipping Address</h3>
                                <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 bg-surface border border-border rounded-lg" required />
                                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 bg-surface border border-border rounded-lg" required />
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg" required />
                                    <input type="text" name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg" required />
                                    <select name="country" value={formData.country} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg">
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="UK">United Kingdom</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-text-primary">Payment Information</h3>
                                <input type="text" name="cardNumber" placeholder="Card Number" value={formData.cardNumber} onChange={handleChange} className="w-full px-3 py-2 bg-surface border border-border rounded-lg" required />
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="text" name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg" required />
                                    <input type="text" name="cvc" placeholder="CVC" value={formData.cvc} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg" required />
                                    <input type="text" name="nameOnCard" placeholder="Name on Card" value={formData.nameOnCard} onChange={handleChange} className="px-3 py-2 bg-surface border border-border rounded-lg" required />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-light">
                                    Back
                                </button>
                            )}
                            <button type="submit" className={cn('px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600', step === 1 && 'w-full')}>
                                {step === 3 ? 'Place Order' : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-surface border border-border rounded-lg p-6 h-fit">
                <h3 className="font-semibold text-text-primary mb-4">Order Summary</h3>
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-text-secondary">{item.name} x{item.quantity}</span>
                            <span className="text-text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Subtotal</span>
                            <span className="text-text-primary">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Shipping</span>
                            <span className="text-text-primary">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Tax</span>
                            <span className="text-text-primary">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border">
                            <span className="text-text-primary">Total</span>
                            <span className="text-primary-500">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Checkout.displayName = 'Checkout';
export default Checkout;