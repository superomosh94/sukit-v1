# ðŸ—ï¸ SUKIT - SYSTEM ARCHITECTURE

## High-Level Architecture
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ USER INTERFACE â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ React App â”‚ â”‚ Electron â”‚ â”‚ CLI Tool â”‚ â”‚
â”‚ â”‚ (Visual â”‚ â”‚ (Desktop â”‚ â”‚ (Terminal) â”‚ â”‚
â”‚ â”‚ Builder) â”‚ â”‚ Wrapper) â”‚ â”‚ â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”‚ â”‚ â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”‚ â”‚
â”‚ â–¼ â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ API Gateway â”‚ â”‚
â”‚ â”‚ (IPC Bridge + Express) â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”‚ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â”‚
â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ BACKEND SERVICES â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Auth â”‚ â”‚ Project â”‚ â”‚ Plugin â”‚ â”‚ Template â”‚ â”‚
â”‚ â”‚ Service â”‚ â”‚ Service â”‚ â”‚ Service â”‚ â”‚ Service â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Media â”‚ â”‚ Deploy â”‚ â”‚ Form â”‚ â”‚ Popup â”‚ â”‚
â”‚ â”‚ Service â”‚ â”‚ Service â”‚ â”‚ Service â”‚ â”‚ Service â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â”‚
â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ DATA LAYER â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ PostgreSQL â”‚ â”‚ Redis â”‚ â”‚ Prisma â”‚ â”‚ Docker â”‚ â”‚
â”‚ â”‚ (Database) â”‚ â”‚ (Cache) â”‚ â”‚ (ORM) â”‚ â”‚ (Container) â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜



## Frontend Architecture (Visual Builder)
visual-builder/src/
â”‚
â”œâ”€â”€ components/ # Reusable UI components
â”‚ â”œâ”€â”€ shared/ # Button, Modal, Toast, etc.
â”‚ â”œâ”€â”€ dashboard/ # StatsCard, RecentProjects, etc.
â”‚ â”œâ”€â”€ builder/ # Canvas, Toolbar, PropertyPanel
â”‚ â”œâ”€â”€ library/ # ComponentLibrary, CategoryTabs
â”‚ â”œâ”€â”€ theme/ # ColorPalette, TypographyPanel
â”‚ â”œâ”€â”€ settings/ # SettingsTabs, GeneralSettings
â”‚ â””â”€â”€ account/ # ProfileForm, SubscriptionCard
â”‚
â”œâ”€â”€ pages/ # Page components
â”‚ â”œâ”€â”€ Dashboard.jsx
â”‚ â”œâ”€â”€ PageBuilder.jsx
â”‚ â”œâ”€â”€ ComponentLibrary.jsx
â”‚ â”œâ”€â”€ ThemeDesigner.jsx
â”‚ â”œâ”€â”€ Settings.jsx
â”‚ â””â”€â”€ Account.jsx
â”‚
â”œâ”€â”€ stores/ # Zustand state stores
â”‚ â”œâ”€â”€ editorStore.js # Canvas state
â”‚ â”œâ”€â”€ canvasStore.js # Zoom, device, grid
â”‚ â”œâ”€â”€ historyStore.js # Undo/redo
â”‚ â”œâ”€â”€ themeStore.js # Theme settings
â”‚ â”œâ”€â”€ settingsStore.js # App settings
â”‚ â””â”€â”€ userStore.js # User profile
â”‚
â”œâ”€â”€ utils/ # Helper functions
â”‚ â”œâ”€â”€ cn.js # Class name merger
â”‚ â””â”€â”€ componentRegistry.js
â”‚
â”œâ”€â”€ App.jsx # Root component with routing
â”œâ”€â”€ main.jsx # Entry point
â””â”€â”€ index.css # Global styles (Tailwind)



## State Management Flow
User Action (click button)
â”‚
â–¼
Component (Button.jsx)
â”‚
â–¼
Store Action (editorStore.addComponent)
â”‚
â–¼
State Update (Zustand)
â”‚
â–¼
Component Re-renders (Canvas.jsx)
â”‚
â–¼
UI Updates



## Plugin Architecture
Plugin Installation Flow:

User runs: sukit add payment-stripe
â”‚
â–¼
Plugin Manager reads plugin.json
â”‚
â–¼
Checks requirements & conflicts
â”‚
â–¼
Downloads plugin files
â”‚
â–¼
Runs database migrations
â”‚
â–¼
Installs NPM dependencies
â”‚
â–¼
Injects routes into app.ts
â”‚
â–¼
Copies frontend components
â”‚
â–¼
Adds environment variables
â”‚
â–¼
Plugin ready to use



## Database Schema (Prisma)

```prisma
model User {
    id        String   @id @default(cuid())
    email     String   @unique
    password  String
    name      String?
    role      Role     @default(USER)
    createdAt DateTime @default(now())
    
    projects  Project[]
    sessions  Session[]
}

model Project {
    id        String   @id @default(cuid())
    name      String
    userId    String
    pages     Json     @default("[]")
    theme     Json     @default("{}")
    createdAt DateTime @default(now())
    
    user      User     @relation(fields: [userId], references: [id])
}

model Session {
    id        String   @id @default(cuid())
    userId    String
    token     String   @unique
    expiresAt DateTime
    
    user      User     @relation(fields: [userId], references: [id])
}

enum Role {
    USER
    ADMIN
}
API Endpoints
Method	Endpoint	Purpose
POST	/api/auth/login	User login
POST	/api/auth/register	User registration
GET	/api/projects	List projects
POST	/api/projects	Create project
GET	/api/projects/:id	Get project
PUT	/api/projects/:id	Update project
DELETE	/api/projects/:id	Delete project
GET	/api/plugins	List plugins
POST	/api/plugins/:id/install	Install plugin
POST	/api/deploy/vercel	Deploy to Vercel
File Structure Summary
sukit/
â”œâ”€â”€ cli.js                    # CLI entry (400 lines)
â”œâ”€â”€ core/                     # 25 core modules
â”œâ”€â”€ commands/                 # 20 CLI commands
â”œâ”€â”€ plugins/                  # 70+ plugins
â”œâ”€â”€ registry/                 # Plugin registry
â”œâ”€â”€ desktop/                  # Electron app
â”œâ”€â”€ visual-builder/           # React app
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/       # 70+ components
â”‚   â”‚   â”œâ”€â”€ pages/            # 12 pages
â”‚   â”‚   â”œâ”€â”€ stores/           # 10 stores
â”‚   â”‚   â””â”€â”€ utils/            # Helpers
â”‚   â””â”€â”€ package.json
â”œâ”€â”€ templates/                # Project templates
â””â”€â”€ scripts/                  # Utilities
Technology Decisions
Decision	Reason
React over Vue	Larger ecosystem, more developers
Tailwind over CSS-in-JS	Faster development, smaller bundle
Zustand over Redux	Simpler API, less boilerplate
Vite over Webpack	Faster HMR, quicker builds
Electron over Tauri	Faster development (rewrite later)
PostgreSQL over MySQL	Better JSON support, more features
Prisma over TypeORM	Better TypeScript support
Security Considerations
JWT tokens for authentication

bcrypt for password hashing

Helmet.js for security headers

CORS properly configured

Rate limiting on API endpoints

Input validation with Zod

SQL injection prevention via Prisma

XSS protection via React
