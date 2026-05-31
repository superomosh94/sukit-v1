# ðŸ¤ CONTRIBUTING TO SUKIT

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all.


## How to Contribute

### 1. Report Bugs

Open an issue on GitHub with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 2. Suggest Features

Open an issue with:
- Feature description
- Use case
- Mockups if applicable

### 3. Submit Code

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/yourusername/sukit.git
cd sukit

# Create a branch
git checkout -b feature/my-feature

# Make changes
# Commit with conventional commit message
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/my-feature

# Open a Pull Request
Development Setup
bash
# Clone repository
git clone https://github.com/sukit/sukit.git
cd sukit

# Install dependencies
npm install
cd visual-builder && npm install
cd ../registry && npm install
cd ../desktop && npm install
cd ..

# Start development servers
npm run dev           # Frontend (Vite)
cd registry && npm start  # Registry
cd desktop && npm start   # Electron app
Code Standards
File Structure
src/
â”œâ”€â”€ components/     # Reusable UI components
â”œâ”€â”€ pages/          # Page components
â”œâ”€â”€ stores/         # Zustand stores
â”œâ”€â”€ utils/          # Helper functions
â””â”€â”€ styles/         # Global styles
Naming Conventions
Type	Convention	Example
Components	PascalCase	Button.jsx
Hooks	camelCase with 'use'	useAuth.js
Utilities	camelCase	cn.js
Stores	camelCase with 'Store'	editorStore.js
Import Order
javascript
// 1. React
import React, { useState } from 'react';

// 2. Third-party
import { IconName } from 'lucide-react';

// 3. Components
import Button from '../shared/Button';

// 4. Stores
import { useEditorStore } from '../../stores/editorStore';

// 5. Utils
import { cn } from '../../utils/cn';

// 6. Styles
import './styles.css';
Component Template
jsx
import React from 'react';
import { Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

const ComponentName = ({ 
    prop1, 
    prop2, 
    className,
    children 
}) => {
    return (
        <div className={cn('base-classes', className)}>
            {children}
        </div>
    );
};

export default ComponentName;
Store Template
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
            
            // Getters
            getItemCount: () => get().items.length,
        }),
        { name: 'store-name' }
    )
);
Pull Request Process
Ensure all tests pass

Update documentation

Add entry to CHANGELOG.md

Request review from maintainers

Squash commits before merge

Commit Messages
Use conventional commits:

feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: maintenance tasks
Testing
Run Tests
bash
# Lint
npm run lint

# Type check
npm run type-check

# Unit tests
npm test

# E2E tests
npm run test:e2e
Manual Testing Checklist
Component renders correctly

Props work as expected

Events fire correctly

Dark mode works

Responsive design works

No console errors

Works in all browsers

Documentation
Update relevant documentation:

README.md for overview

docs/FEATURES.md for feature status

docs/PLUGIN_DEVELOPMENT.md for plugin guide

CHANGELOG.md for version history

Questions?
Discord: https://discord.gg/sukit

Email: contributors@sukit.dev

GitHub Discussions: https://github.com/sukit/sukit/discussions

Thank you for contributing! ðŸš€
