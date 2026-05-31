import React, { useState } from 'react';
import { Receipt, Download, ChevronRight, CreditCard, Plus, Trash2 } from 'lucide-react';

const Billing = () => {
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    
    const invoices = [
        { id: 'INV-001', date: 'Apr 15, 2024', amount: 29.00, status: 'paid', description: 'Pro Plan - Monthly' },
        { id: 'INV-002', date: 'Mar 15, 2024', amount: 29.00, status: 'paid', description: 'Pro Plan - Monthly' },
        { id: 'INV-003', date: 'Feb 15, 2024', amount: 29.00, status: 'paid', description: 'Pro Plan - Monthly' },
    ];

    const paymentMethods = [
        { id: 1, type: 'card', last4: '4242', brand: 'Visa', expiry: '12/2026', isDefault: true },
        { id: 2, type: 'card', last4: '5555', brand: 'Mastercard', expiry: '08/2025', isDefault: false },
    ];

    const handleDownloadInvoice = (invoiceId) => {
        alert(`Downloading invoice ${invoiceId}`);
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Billing History</h3>
            </div>

            {/* Payment Methods */}
            <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-text-primary">Payment Methods</h4>
                    <button
                        onClick={() => setShowAddPaymentModal(true)}
                        className="flex items-center gap-1 text-sm text-primary-500 hover:underline"
                    >
                        <Plus className="w-3 h-3" />
                        Add Payment Method
                    </button>
                </div>
                <div className="space-y-3">
                    {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-primary-500" />
                                <div>
                                    <p className="text-sm text-text-primary">
                                        {method.brand} •••• {method.last4}
                                    </p>
                                    <p className="text-xs text-text-secondary">Expires {method.expiry}</p>
                                </div>
                                {method.isDefault && (
                                    <span className="text-xs bg-primary-500/20 text-primary-500 px-2 py-0.5 rounded">
                                        Default
                                    </span>
                                )}
                            </div>
                            <button className="p-1 rounded hover:bg-surface-light">
                                <Trash2 className="w-4 h-4 text-danger-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invoice List */}
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <h4 className="font-medium text-text-primary">Invoice History</h4>
                </div>
                <div className="divide-y divide-border">
                    {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-surface-light transition-colors">
                            <div>
                                <p className="font-medium text-text-primary">{invoice.description}</p>
                                <p className="text-sm text-text-secondary">{invoice.date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-medium ${
                                    invoice.status === 'paid' ? 'text-success-500' : 'text-warning-500'
                                }`}>
                                    ${invoice.amount}
                                </span>
                                <button
                                    onClick={() => handleDownloadInvoice(invoice.id)}
                                    className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                                    title="Download Invoice"
                                >
                                    <Download className="w-4 h-4 text-text-secondary" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-text-secondary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Payment Method Modal */}
            {showAddPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-semibold text-text-primary">Add Payment Method</h2>
                            <button onClick={() => setShowAddPaymentModal(false)} className="p-1 rounded hover:bg-surface-light">
                                <span className="text-2xl text-text-secondary">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">CVC</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Name on Card</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-border">
                            <button
                                onClick={() => setShowAddPaymentModal(false)}
                                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Add Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
