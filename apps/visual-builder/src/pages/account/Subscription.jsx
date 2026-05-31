import React, { useState } from 'react';
import { CreditCard, Check, Zap, Crown, Sparkles, ShoppingBag } from 'lucide-react';

const Subscription = () => {
    const [currentPlan, setCurrentPlan] = useState('pro');

    const plans = [
        { 
            id: 'free', 
            name: 'Free', 
            price: '$0', 
            period: 'forever',
            icon: Zap,
            features: [
                '1 Project',
                'Basic Components',
                'Community Support',
                '500 MB Storage',
                'API Access (Limited)'
            ],
            limitations: [
                'No Custom Domain',
                'No Team Collaboration',
                'No Advanced Analytics'
            ]
        },
        { 
            id: 'pro', 
            name: 'Pro', 
            price: '$29', 
            period: 'per month',
            icon: Sparkles,
            features: [
                'Unlimited Projects',
                'All Components',
                'Priority Support',
                '10 GB Storage',
                'Full API Access',
                'Custom Domain',
                'Team Collaboration (up to 5)',
                'Advanced Analytics'
            ]
        },
        { 
            id: 'enterprise', 
            name: 'Enterprise', 
            price: 'Custom', 
            period: 'contact us',
            icon: Crown,
            features: [
                'Everything in Pro',
                'Unlimited Team Members',
                'SSO Authentication',
                'SLA Guarantee',
                'Dedicated Support',
                'Custom Development',
                'On-premise Deployment',
                '99.9% Uptime SLA'
            ]
        },
    ];

    const handleUpgrade = (planId) => {
        if (planId !== currentPlan) {
            setCurrentPlan(planId);
            alert(`You have selected the ${plans.find(p => p.id === planId).name} plan. This is a demo.`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Subscription Plan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    return (
                        <div
                            key={plan.id}
                            className={`bg-surface border rounded-xl overflow-hidden transition-all ${
                                isCurrent ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-border'
                            }`}
                        >
                            <div className="p-6 text-center border-b border-border">
                                <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <plan.icon className="w-6 h-6 text-primary-500" />
                                </div>
                                <h4 className="text-xl font-bold text-text-primary">{plan.name}</h4>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                                    <span className="text-text-secondary">/{plan.period}</span>
                                </div>
                                {isCurrent && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-primary-500/20 text-primary-500 text-xs rounded-full">
                                        Current Plan
                                    </span>
                                )}
                            </div>

                            <div className="p-6 space-y-3">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-success-500 flex-shrink-0" />
                                        <span className="text-text-primary">{feature}</span>
                                    </div>
                                ))}
                                {plan.limitations && (
                                    <>
                                        <div className="border-t border-border my-3"></div>
                                        {plan.limitations.map((limitation, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm opacity-50">
                                                <span className="w-4 h-4 flex-shrink-0">•</span>
                                                <span className="text-text-secondary">{limitation}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="p-6 border-t border-border">
                                {!isCurrent ? (
                                    <button
                                        onClick={() => handleUpgrade(plan.id)}
                                        className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                    >
                                        {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-2 bg-surface-light text-text-secondary rounded-lg cursor-not-allowed"
                                    >
                                        Current Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-sm text-text-primary">Next billing date</p>
                        <p className="text-xs text-text-secondary">Your subscription renews on <span className="font-medium">May 15, 2024</span></p>
                    </div>
                    <button className="text-sm text-danger-500 hover:underline">Cancel Subscription</button>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
