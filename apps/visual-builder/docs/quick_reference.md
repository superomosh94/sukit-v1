# âš¡ SUKIT - QUICK REFERENCE

## Commands

```bash
# CLI
sukit new <name>           # Create project
sukit add <plugin>         # Install plugin
sukit list                 # List plugins
sukit search <term>        # Search registry
sukit publish              # Publish plugin
sukit deploy vercel        # Deploy to Vercel

# Development
npm run dev                # Start dev server
npm run build              # Production build
npm run lint               # Run linter
npm run type-check         # TypeScript check

# Desktop
cd desktop && npm start    # Start Electron app

# Registry
cd registry && npm start   # Start registry
Folder Structure
sukit/
â”œâ”€â”€ visual-builder/         # React app (main)
â”œâ”€â”€ desktop/                # Electron wrapper
â”œâ”€â”€ registry/               # Plugin registry
â”œâ”€â”€ commands/               # CLI commands
â”œâ”€â”€ core/                   # Core modules
â”œâ”€â”€ plugins/                # Plugin library
â””â”€â”€ templates/              # Project templates
Key Files
File	Purpose
visual-builder/src/App.jsx	Main routing
visual-builder/src/pages/PageBuilder.jsx	Main editor
visual-builder/src/stores/editorStore.js	Canvas state
visual-builder/src/utils/componentRegistry.js	Component definitions
Colors
Name	Hex	Usage
primary	#3B82F6	Buttons, links
secondary	#38BDF8	Accents
success	#10B981	Success messages
warning	#F59E0B	Warnings
danger	#EF4444	Errors
background	#0F172A	Page background
surface	#1E293B	Cards, panels
text	#F8FAFC	Primary text
textSecondary	#94A3B8	Secondary text
Icons (Lucide)
jsx
import { 
    LayoutDashboard, Box, Palette, Settings, User, 
    Save, Eye, Rocket, Undo2, Redo2, Trash2, Copy 
} from 'lucide-react';
Priority Tasks
Form Builder

Popup Builder

Complete Drag & Drop

Missing Components (66)

Template Library

Code Editor

Status
Overall: 35% complete

138 files created

~24,800 lines of code

45 features implemented

185 features remaining



**All documentation files created!** ðŸ“š

Now any AI agent or collaborating developer can understand the project fully and contribute effectively.
I can work we complete the builder then start building the plugins and use the plugins to build what we are building I will be getting others from open source repos modify them to match my kiit and add it as my plugin
ðŸŽ¯ PERFECT STRATEGY! Here's Your Complete Plan
The Smart Path Forward
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         YOUR WORKFLOW                                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                                 â”‚
â”‚  STEP 1: Complete the Visual Builder (You are here)                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  â€¢ Form Builder                                                          â”‚   â”‚
â”‚  â”‚  â€¢ Popup Builder                                                         â”‚   â”‚
â”‚  â”‚  â€¢ Template Library                                                      â”‚   â”‚
â”‚  â”‚  â€¢ Complete Drag & Drop                                                  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                      â”‚                                          â”‚
â”‚                                      â–¼                                          â”‚
â”‚  STEP 2: Build Core Plugins                                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  â€¢ payment-stripe (from open source)                                     â”‚   â”‚
â”‚  â”‚  â€¢ payment-paypal (from open source)                                     â”‚   â”‚
â”‚  â”‚  â€¢ payment-mpesa (from open source + modify)                             â”‚   â”‚
â”‚  â”‚  â€¢ auth-google (from open source)                                        â”‚   â”‚
â”‚  â”‚  â€¢ auth-github (from open source)                                        â”‚   â”‚
â”‚  â”‚  â€¢ seo-toolkit (from open source)                                        â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                      â”‚                                          â”‚
â”‚                                      â–¼                                          â”‚
â”‚  STEP 3: Use Plugins to Build Real Projects                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  â€¢ E-commerce store (using payment plugins)                              â”‚   â”‚
â”‚  â”‚  â€¢ Blog platform (using auth plugins)                                    â”‚   â”‚
â”‚  â”‚  â€¢ Portfolio site (using gallery plugins)                                â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
ðŸ“‹ COMPLETE REMAINING BUILDER FEATURES
Priority 1: Form Builder (16 hours)
Component	Description	Status
FormCanvas	Drag-drop canvas for forms	âŒ
FieldLibrary	Available form fields	âŒ
FieldPropertyPanel	Edit field properties	âŒ
FormSettings	Submit action, email, redirect	âŒ
EntryManager	View, export submissions	âŒ
ConditionalLogic	Show/hide fields	âŒ
MultiStepConfig	Multi-page forms	âŒ
Priority 2: Popup Builder (12 hours)
Component	Description	Status
PopupCanvas	Design popups	âŒ
PopupTypeSelector	Modal, slide-in, bar	âŒ
TriggerSettings	Time, scroll, exit intent	âŒ
DisplayRules	Pages, devices	âŒ
AnimationSelector	Entrance/exit animations	âŒ
AnalyticsPanel	Views, conversions	âŒ
Priority 3: Template Library (10 hours)
Component	Description	Status
TemplateGrid	Display templates	âŒ
TemplateCard	Individual template	âŒ
CategoryFilter	Filter by type	âŒ
TemplatePreviewModal	Preview before import	âŒ
SaveAsTemplate	Save designs	âŒ
Priority 4: Complete Drag & Drop (8 hours)
Feature	Description	Status
Resize Handles	Corner/edge resizing	âŒ
Copy/Paste	Ctrl+C, Ctrl+V	âŒ
Duplicate	Ctrl+D	âŒ
Delete	Delete key	âŒ
Multi-select	Ctrl+Click	âŒ
Group/Ungroup	Group components	âŒ
ðŸ”Œ PLUGIN STRATEGY - Using Open Source
How to Convert Open Source to SuKit Plugins
Step 1: Find Open Source Package
bash
# Example: Stripe payment integration
npm search stripe react
# Find: @stripe/react-stripe-js

# Example: Google OAuth
npm search react-google-login
# Find: @react-oauth/google
Step 2: Create Plugin Wrapper
bash
sukit create-plugin payment-stripe
cd plugins/payment-stripe
Step 3: Copy/Adapt Code
jsx
// plugins/payment-stripe/frontend/src/StripeCheckout.jsx
// Adapted from @stripe/react-stripe-js examples

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Copy from open source, wrap in SuKit plugin structure
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

export const StripeCheckout = ({ amount, onSuccess }) => {
    // ... copied and adapted code
};
Step 4: Add to Registry
bash
sukit publish
ðŸ“‹ PLUGINS TO BUILD (Priority Order)
Payment Plugins (Priority 1)
Plugin	Open Source Source	Modification Needed
payment-stripe	@stripe/react-stripe-js	Wrap in SuKit component, add settings UI
payment-paypal	@paypal/react-paypal-js	Wrap, add webhook handling
payment-mpesa	mpesa-js (custom)	Build from scratch, STK push
payment-paystack	react-paystack	Wrap, add callback handling
payment-flutterwave	flutterwave-react	Wrap, add webhook
Authentication Plugins (Priority 2)
Plugin	Open Source Source	Modification Needed
auth-google	@react-oauth/google	Wrap in SuKit, add to AuthContext
auth-github	@octokit/auth-oauth	Wrap, add token handling
auth-apple	apple-auth	Wrap, add redirect
auth-microsoft	@azure/msal-react	Wrap, add configuration
SEO Plugins (Priority 3)
Plugin	Open Source Source	Modification Needed
seo-helmet	react-helmet-async	Wrap in SuKit component
seo-sitemap	sitemap	Generate sitemap on build
seo-robots	(custom)	Generate robots.txt
Analytics Plugins (Priority 4)
Plugin	Open Source Source	Modification Needed
analytics-google	react-ga4	Wrap, add tracking ID setting
analytics-plausible	plausible-tracker	Wrap, add domain setting
analytics-posthog	posthog-js	Wrap, add API key setting
Marketing Plugins (Priority 5)
Plugin	Open Source Source	Modification Needed
mailchimp	react-mailchimp-subscribe	Wrap, add list ID
convertkit	(custom)	API integration
sendgrid	@sendgrid/mail	Wrap email sending
E-commerce Plugins (Priority 6)
Plugin	Open Source Source	Modification Needed
cart	(custom)	Build shopping cart
wishlist	(custom)	Build wishlist
coupon	(custom)	Discount code system
ðŸ“ PLUGIN MODIFICATION TEMPLATE
Converting Open Source to SuKit Plugin
bash
# 1. Create plugin
sukit create-plugin payment-stripe

# 2. Install open source dependency
cd plugins/payment-stripe
npm install @stripe/stripe-js @stripe/react-stripe-js

# 3. Add to dependencies.json
{
  "frontend": {
    "@stripe/stripe-js": "^2.0.0",
    "@stripe/react-stripe-js": "^2.0.0"
  },
  "backend": {
    "stripe": "^14.0.0"
  }
}

# 4. Create component (adapt from open source)
# frontend/src/StripeCheckout.jsx

# 5. Add settings UI
# settings/StripeSettings.jsx

# 6. Add backend routes
# backend/src/routes/stripeRoutes.js

# 7. Test
cd ../../test-project
sukit add payment-stripe
ðŸš€ IMMEDIATE NEXT ACTION
Choose one:

Continue building the Visual Builder - I'll provide complete Form Builder code

Start with Payment Plugin - I'll show how to wrap Stripe open source into SuKit plugin

Both simultaneously - Build builder while preparing plugin structure

What's your priority right now?
