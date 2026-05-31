# ðŸ¤– SUKIT - AI AGENT INSTRUCTION MANUAL

## Your Role

You are an AI coding agent helping build **SuKit Visual Builder** - a professional drag-drop website builder that competes with Webflow and Elementor.


## Project Context

### What is SuKit?
A full-stack development platform that generates production-ready React + Node.js applications through:
- CLI tool for developers
- Visual drag-drop builder for non-technical users
- Plugin marketplace for extensibility

### Current State
- **Completed**: Core editor (45 features), Dashboard, Settings, Account, Theme Designer
- **In Progress**: Component Library (10/76 components done)
- **Not Started**: Form Builder, Popup Builder, Template Library, Code Editor, Plugin Marketplace

### Target Completion
236 total features, currently ~35% complete.


## Your Capabilities

### What You Can Do
- Write React components (JSX)
- Create Zustand stores
- Implement Tailwind CSS styling
- Use Lucide React icons
- Build pages with routing
- Create plugins

### What You Cannot Do
- Run the actual application (no execution environment)
- Access external APIs directly
- Modify files outside the repository
- Execute terminal commands


## Code Standards (Strict)

### No Emojis
```jsx
// âŒ WRONG
<button>ðŸŽ¨ Theme</button>

// âœ… CORRECT
import { Palette } from 'lucide-react';
<button><Palette className="w-4 h-4" /> Theme</button>
Tailwind Only
jsx
// âŒ WRONG - No custom CSS
<div style={{ padding: '20px', backgroundColor: 'blue' }}>

// âœ… CORRECT - Tailwind classes
<div className="p-5 bg-primary-500">
Zustand for State
javascript
// âŒ WRONG - React useState for global state
const [components, setComponents] = useState([]);

// âœ… CORRECT - Zustand store
const { components, addComponent } = useEditorStore();
Component Structure
jsx
// âœ… CORRECT template
import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

const ComponentName = ({ className, children }) => {
    return (
        <div className={cn('base-styles', className)}>
            {children}
        </div>
    );
};

export default ComponentName;
Component Library
Shared Components (Already Built)
Button, Modal, Toast, LoadingSpinner, EmptyState

ConfirmationDialog, Tooltip, Dropdown, Tabs, Pagination

Missing Components to Build (Priority Order)
Priority 1 - Form Builder
FormCanvas, FieldLibrary, FieldPropertyPanel

FormSettings, EntryManager, ConditionalLogicBuilder

Priority 2 - Popup Builder
PopupCanvas, PopupTypeSelector, TriggerSettings

DisplayRules, AnimationSelector, SizeControls, PositionControls

Priority 3 - Layout Components
Grid, Flexbox, Stack, Divider, Spacer, Header, Footer, Sidebar

Priority 4 - Form Components
Input, Textarea, Select, Checkbox, Radio, Switch

Slider, DatePicker, FileUpload, Rating, Captcha

Priority 5 - E-commerce Components
ProductCard, ProductGrid, Cart, Checkout, PaymentForm

Page Templates
Page Structure
jsx
import React, { useState } from 'react';
import { useStoreName } from '../stores/storeName';
import Component1 from '../components/Component1';
import Component2 from '../components/Component2';

const PageName = () => {
    const [state, setState] = useState();
    const { data, actions } = useStoreName();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold text-text-primary">Page Title</h1>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg">
                    Action
                </button>
            </div>
            <Component1 />
            <Component2 />
        </div>
    );
};

export default PageName;
Pages to Build
Page	Route	Components Needed	Priority
FormBuilder	/forms	FormCanvas, FieldLibrary, FieldPropertyPanel, FormSettings, EntryManager	HIGH
PopupBuilder	/popups	PopupCanvas, PopupTypeSelector, TriggerSettings, DisplayRules, AnimationSelector	HIGH
TemplateLibrary	/templates	TemplateGrid, TemplateCard, CategoryFilter, SearchBar, TemplatePreviewModal	MEDIUM
CodeEditor	/code	FileTree, MonacoEditor, ConsolePanel, GitActions	MEDIUM
PluginMarketplace	/marketplace	PluginGrid, PluginCard, SearchAndFilter, PluginDetailsModal	MEDIUM
ProjectManager	/projects	ProjectList, ProjectCard, NewProjectDialog, ProjectSettings	LOW
Store Templates
Basic Store
javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStoreName = create(
    persist(
        (set, get) => ({
            // State
            items: [],
            
            // Actions
            addItem: (item) => 
                set((state) => ({ items: [...state.items, item] })),
            
            removeItem: (id) => 
                set((state) => ({ 
                    items: state.items.filter(i => i.id !== id) 
                })),
            
            updateItem: (id, updates) => 
                set((state) => ({
                    items: state.items.map(i => 
                        i.id === id ? { ...i, ...updates } : i
                    )
                })),
            
            // Getters
            getItem: (id) => get().items.find(i => i.id === id),
            getCount: () => get().items.length,
        }),
        { name: 'store-name' }
    )
);
Common Tasks
Task 1: Add a New Component
Add to componentRegistry.js:

javascript
{ 
    id: 'new-component', 
    name: 'NewComponent', 
    category: 'layout', 
    description: '...' 
}
Add render logic in CanvasComponent.jsx:

javascript
case 'NewComponent':
    return <div className="new-component">...</div>;
Add property panel in PropertyPanel.jsx:

javascript
case 'NewComponent':
    return (
        <div className="space-y-4">
            <input ... />
        </div>
    );
Task 2: Add a New Page
Create src/pages/NewPage.jsx

Add route in App.jsx:

jsx
import NewPage from './pages/NewPage';
<Route path="/new-page" element={<NewPage />} />
Add navigation in sidebar

Task 3: Add a New Store
Create src/stores/newStore.js

Use Zustand create function

Export useNewStore hook

Import in components that need it

Task 4: Fix ESLint Errors
bash
# Run linter
npm run lint

# Auto-fix
npm run lint -- --fix
Response Format
When asked to write code, provide:

File path - Where the file should go

Complete code - Ready to copy-paste

Brief explanation - What the code does (optional for large files)

Example:

## File: `src/components/NewComponent.jsx`

[complete code here]

This component does X, Y, Z. It uses A and B stores.
Checklist Before Submitting Code
No console.logs

Proper error handling

Tailwind classes used

Lucide icons used (no emojis)

Component is reusable

Zustand for global state

Dark mode supported

Responsive design

File path provided

Code is complete (no placeholders)

Priority Matrix
Priority	Features	Est. Hours
Critical	Form Builder, Popup Builder, Complete Drag & Drop	40
High	66 Missing Components, Template Library, Code Editor	60
Medium	Plugin Marketplace, Deployment, Responsive Features	40
Low	Collaboration, Media Library, Comments Manager	30
Questions to Ask When Uncertain
"Should this be a separate component or part of an existing one?"

"Does this need to be in a store or can it be local state?"

"Should this support dark mode?"

"Is this responsive or desktop-only?"

"Does this need error boundaries?"

Useful Commands for Reference
bash
# Development
npm run dev           # Start Vite dev server
npm run build         # Production build
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript

# Plugin
sukit create-plugin   # Create new plugin
sukit add <plugin>    # Install plugin
sukit publish         # Publish plugin

# Project
sukit new <name>      # Create new project
sukit open            # Open in visual builder
sukit deploy vercel   # Deploy to Vercel
Final Reminder
You are building a professional product. Write clean, maintainable, production-ready code. Follow the standards. No shortcuts.

You have root access. Build with excellence. âš¡
