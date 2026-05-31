# ðŸ”Œ SUKIT API REFERENCE

## REST API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
    "username": "john",
    "email": "john@example.com",
    "password": "secure123"
}
Response:

json
{
    "token": "jwt_token",
    "user": {
        "id": "user_123",
        "username": "john",
        "email": "john@example.com"
    }
}
POST /api/auth/login
Login existing user.

Request:

json
{
    "username": "john",
    "password": "secure123"
}
Response:

json
{
    "token": "jwt_token",
    "user": {
        "id": "user_123",
        "username": "john",
        "email": "john@example.com"
    }
}
Projects
GET /api/projects
List all projects for authenticated user.

Response:

json
[
    {
        "id": "proj_123",
        "name": "My Website",
        "lastModified": "2024-01-15T10:00:00Z",
        "pages": 5
    }
]
POST /api/projects
Create a new project.

Request:

json
{
    "name": "New Project",
    "description": "My awesome project",
    "template": "blank"
}
Response:

json
{
    "id": "proj_456",
    "name": "New Project",
    "createdAt": "2024-01-15T10:00:00Z"
}
GET /api/projects/:id
Get project details.

Response:

json
{
    "id": "proj_123",
    "name": "My Website",
    "pages": [...],
    "components": [...],
    "theme": {...}
}
PUT /api/projects/:id
Update project.

Request:

json
{
    "name": "Updated Name",
    "theme": {
        "colors": {...},
        "typography": {...}
    }
}
DELETE /api/projects/:id
Delete project.

Plugins
GET /api/plugins
List available plugins.

Response:

json
[
    {
        "id": "plugin_123",
        "name": "payment-stripe",
        "displayName": "Stripe Payments",
        "version": "1.0.0",
        "downloads": 15234,
        "rating": 4.8
    }
]
POST /api/plugins/:id/install
Install a plugin.

Response:

json
{
    "success": true,
    "message": "Plugin installed successfully"
}
POST /api/plugins/:id/uninstall
Uninstall a plugin.

Deployment
POST /api/deploy/vercel
Deploy to Vercel.

Request:

json
{
    "projectId": "proj_123",
    "environment": "production"
}
Response:

json
{
    "url": "https://my-project.vercel.app",
    "deploymentId": "dep_123"
}
POST /api/deploy/railway
Deploy to Railway.

WebSocket Events (Real-time)
Connection
javascript
const ws = new WebSocket('ws://localhost:3000/ws');
Events
project:update
Sent when project changes.

json
{
    "type": "project:update",
    "data": {
        "projectId": "proj_123",
        "components": [...]
    }
}
cursor:move
Sent when user moves cursor.

json
{
    "type": "cursor:move",
    "data": {
        "userId": "user_123",
        "position": { "x": 100, "y": 200 }
    }
}
Error Codes
Code	Description
400	Bad Request - Invalid parameters
401	Unauthorized - Missing or invalid token
403	Forbidden - Insufficient permissions
404	Not Found - Resource doesn't exist
409	Conflict - Resource already exists
422	Unprocessable Entity - Validation failed
500	Internal Server Error
Rate Limits
Endpoint	Limit	Window
/api/auth/*	5 requests	15 minutes
/api/projects/*	100 requests	1 hour
/api/plugins/*	50 requests	1 hour
/api/deploy/*	10 requests	1 hour
