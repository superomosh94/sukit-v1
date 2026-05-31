# ðŸ”Œ SUKIT PLUGIN DEVELOPMENT GUIDE

## Overview

Plugins are self-contained packages that extend SuKit functionality. They can add:
- Frontend React components
- Backend Express routes
- Database schemas
- Configuration UI
- Assets (icons, images)


## Plugin Structure
my-plugin/
â”œâ”€â”€ plugin.json # REQUIRED - Manifest file
â”œâ”€â”€ README.md # REQUIRED - Documentation
â”œâ”€â”€ package.json # REQUIRED - NPM dependencies
â”œâ”€â”€ dependencies.json # REQUIRED - Runtime dependencies
â”œâ”€â”€ env-vars.json # REQUIRED - Environment variables
â”œâ”€â”€ routes.json # REQUIRED - API routes to inject
â”œâ”€â”€ frontend/
â”‚ â””â”€â”€ src/
â”‚ â”œâ”€â”€ components/ # React components
â”‚ â”œâ”€â”€ hooks/ # Custom hooks
â”‚ â””â”€â”€ services/ # API services
â”œâ”€â”€ backend/
â”‚ â””â”€â”€ src/
â”‚ â”œâ”€â”€ controllers/ # Request handlers
â”‚ â”œâ”€â”€ routes/ # Express routes
â”‚ â””â”€â”€ services/ # Business logic
â””â”€â”€ prisma/
â””â”€â”€ migrations/ # Database migrations



## Step 1: Create Plugin Scaffold

```bash
# Create new plugin
sukit create-plugin payment-stripe

# Output:
# plugins/payment-stripe/
# â”œâ”€â”€ plugin.json
# â”œâ”€â”€ README.md
# â”œâ”€â”€ frontend/
# â””â”€â”€ backend/
Step 2: Configure plugin.json
json
{
  "name": "payment-stripe",
  "version": "1.0.0",
  "displayName": "Stripe Payments",
  "description": "Accept credit card payments via Stripe",
  "category": "payments",
  "author": "Your Name",
  "license": "MIT",
  "icon": "credit-card",
  
  "requirements": ["auth-jwt", "db-postgres"],
  "conflicts": ["payment-paypal"],
  
  "settings": {
    "publishableKey": "",
    "secretKey": "",
    "webhookSecret": "",
    "currency": "USD"
  },
  
  "frontend": {
    "components": ["StripeCheckout", "StripeCardElement"],
    "hooks": ["useStripe"]
  },
  
  "backend": {
    "routes": ["/api/stripe"],
    "webhooks": ["/api/stripe/webhook"]
  },
  
  "envVars": [
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
  ]
}
Step 3: Add Dependencies
dependencies.json
json
{
  "frontend": {
    "@stripe/stripe-js": "^2.0.0",
    "@stripe/react-stripe-js": "^2.0.0"
  },
  "backend": {
    "stripe": "^14.0.0"
  }
}
env-vars.json
json
[
  "STRIPE_PUBLISHABLE_KEY=pk_test_xxx",
  "STRIPE_SECRET_KEY=sk_test_xxx",
  "STRIPE_WEBHOOK_SECRET=whsec_xxx"
]
routes.json
json
[
  {
    "path": "/api/stripe",
    "file": "stripeRoutes",
    "importName": "stripeRoutes"
  }
]
Step 4: Write Frontend Code
frontend/src/components/StripeCheckout.jsx
jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        
        setLoading(true);
        
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });
        
        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }
        
        // Send to backend
        const response = await fetch('/api/stripe/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            onSuccess?.(data);
        } else {
            setError(data.error);
        }
        
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <CardElement className="stripe-card-element" />
            {error && <div className="text-danger-500 text-sm mt-2">{error}</div>}
            <button 
                type="submit" 
                disabled={!stripe || loading}
                className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg"
            >
                {loading ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

export const StripeCheckout = ({ amount, onSuccess }) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm amount={amount} onSuccess={onSuccess} />
        </Elements>
    );
};
Step 5: Write Backend Code
backend/src/controllers/StripeController.js
javascript
const Stripe = require('stripe');

export class StripeController {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    async createPayment(req, res) {
        try {
            const { paymentMethodId, amount } = req.body;
            
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amount * 100, // Convert to cents
                currency: process.env.STRIPE_CURRENCY || 'usd',
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                confirm: true,
            });
            
            res.json({ success: true, paymentIntent });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        let event;
        
        try {
            event = this.stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
        switch (event.type) {
            case 'payment_intent.succeeded':
                // Handle successful payment
                break;
            case 'payment_intent.payment_failed':
                // Handle failed payment
                break;
        }
        
        res.json({ received: true });
    }
}
backend/src/routes/stripeRoutes.js
javascript
import { Router } from 'express';
import { StripeController } from '../controllers/StripeController';

const router = Router();
const controller = new StripeController();

router.post('/create-payment', controller.createPayment.bind(controller));
router.post('/webhook', express.raw({type: 'application/json'}), controller.handleWebhook.bind(controller));

export default router;
Step 6: Add Database Schema
prisma/schema.prisma
prisma
model StripeCustomer {
    id        String   @id @default(cuid())
    userId    String   @unique
    customerId String  @unique
    createdAt DateTime @default(now())
}

model StripePayment {
    id            String   @id @default(cuid())
    paymentIntentId String @unique
    amount        Int
    currency      String
    status        String
    userId        String
    createdAt     DateTime @default(now())
}
prisma/migrations/001_add_stripe_tables/migration.sql
sql
CREATE TABLE "StripeCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL UNIQUE,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "StripePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentIntentId" TEXT NOT NULL UNIQUE,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
Step 7: Create Settings UI
settings/StripeSettings.jsx
jsx
import React, { useState } from 'react';

export const StripeSettings = ({ settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm text-text-secondary mb-1">
                    Publishable Key
                </label>
                <input
                    type="text"
                    value={localSettings.publishableKey}
                    onChange={(e) => setLocalSettings({...localSettings, publishableKey: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                />
            </div>
            <div>
                <label className="block text-sm text-text-secondary mb-1">
                    Secret Key
                </label>
                <input
                    type="password"
                    value={localSettings.secretKey}
                    onChange={(e) => setLocalSettings({...localSettings, secretKey: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                />
            </div>
            <button
                onClick={() => onSave(localSettings)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg"
            >
                Save Settings
            </button>
        </div>
    );
};
Step 8: Test Plugin Locally
bash
# Create a test project
sukit new test-app
cd test-app

# Install your plugin
sukit add payment-stripe

# Set environment variables
echo "STRIPE_PUBLISHABLE_KEY=pk_test_xxx" >> .env
echo "STRIPE_SECRET_KEY=sk_test_xxx" >> .env

# Run the app
npm run dev
Step 9: Publish Plugin
bash
# Login to registry
sukit login

# Navigate to plugin directory
cd plugins/payment-stripe

# Validate plugin
sukit publish --dry-run

# Publish to marketplace
sukit publish
Plugin Best Practices
1. Naming Convention
Use lowercase with hyphens: payment-stripe, auth-google

Prefix with category: payment-, auth-, db-, ui-

2. Versioning
Follow semver: major.minor.patch

Update version in plugin.json before publishing

3. Documentation
Include README.md with:

Installation instructions

Configuration steps

Usage examples

API reference

4. Error Handling
Always return proper HTTP status codes

Provide meaningful error messages

Log errors for debugging

5. Security
Never hardcode API keys

Use environment variables

Validate user input

Sanitize database queries

Example Plugins to Build
Plugin	Difficulty	Hours
payment-stripe	Medium	8
payment-paypal	Medium	6
payment-mpesa	Hard	10
auth-google	Easy	4
auth-github	Easy	4
seo-toolkit	Medium	6
analytics-google	Easy	3
recaptcha	Easy	2
Common Issues & Solutions
Issue	Solution
Plugin not found	Check plugin.json exists in plugins/ folder
Dependencies not installed	Run npm install in project root
Routes not registered	Check routes.json format
Environment variables missing	Copy .env.example to .env
Database migration fails	Run npx prisma migrate dev
Support
Documentation: https://sukit.dev/docs

Discord: https://discord.gg/sukit

GitHub Issues: https://github.com/sukit/issues
