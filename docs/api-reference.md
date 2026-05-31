# API Reference

Base URL: `http://localhost:3000/api`

All endpoints except auth require a session cookie or `Authorization: Bearer <token>` header.

---

## Auth

### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string (min 8 chars)"
}

Response 201:
{
  "user": { "id": "string", "name": "string", "email": "string" },
  "session": { "token": "string" }
}
```

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response 200:
{
  "user": { "id": "string", "name": "string", "email": "string" },
  "session": { "token": "string" }
}
```

### Logout

```
POST /api/auth/logout
Response 200: { "success": true }
```

### Session

```
GET /api/auth/session
Response 200: { "user": { "id": "string", "name": "string", "email": "string" } }
```

---

## Sites

### List Sites

```
GET /api/sites
Response 200: [ { "id": "string", "name": "string", "domain": "string", "pages": number, "createdAt": "string" } ]
```

### Create Site

```
POST /api/sites
{
  "name": "string",
  "domain": "string"
}
Response 201: { "id": "string", "name": "string", "domain": "string", "settings": {} }
```

### Get Site

```
GET /api/sites/:siteId
Response 200: { "id": "string", "name": "string", "domain": "string", "settings": {}, "pages": [] }
```

### Update Site

```
PUT /api/sites/:siteId
{
  "name": "string (optional)",
  "domain": "string (optional)"
}
Response 200: { "id": "string", "name": "string", "domain": "string" }
```

### Delete Site

```
DELETE /api/sites/:siteId
Response 204
```

### Site Settings

```
GET /api/sites/:siteId/settings
Response 200: { "theme": {}, "seo": {}, "favicon": "string", "customCSS": "string" }

PUT /api/sites/:siteId/settings
{
  "theme": { "primaryColor": "string", ... },
  "seo": { "titleTemplate": "string", ... }
}
Response 200: { "theme": {}, "seo": {}, ... }
```

---

## Pages

### List Pages for Site

```
GET /api/sites/:siteId/pages
Response 200: [ { "id": "string", "title": "string", "slug": "string", "status": "string" } ]
```

### Create Page

```
POST /api/sites/:siteId/pages
{
  "title": "string",
  "slug": "string",
  "content": { "sections": [] }
}
Response 201: { "id": "string", "title": "string", "slug": "string", "content": {} }
```

### Get Page

```
GET /api/pages/:pageId
Response 200: { "id": "string", "title": "string", "slug": "string", "content": { "sections": [] }, "status": "string" }
```

### Update Page

```
PUT /api/pages/:pageId
{
  "title": "string (optional)",
  "content": { "sections": [] } (optional)
}
Response 200: { "id": "string", "title": "string", "content": {} }
```

### Delete Page

```
DELETE /api/pages/:pageId
Response 204
```

### Sections

```
GET /api/pages/:pageId/sections
Response 200: [ { "id": "string", "type": "string", "blocks": [], "settings": {} } ]

POST /api/pages/:pageId/sections
{ "type": "string", "settings": {}, "blocks": [] }
Response 201: { "id": "string", "type": "string", ... }
```

### Publish

```
POST /api/pages/:pageId/publish
Response 200: { "id": "string", "status": "published", "publishedAt": "string" }
```

---

## Media

### Upload

```
POST /api/media/upload
Content-Type: multipart/form-data
file: <binary>

Response 201: { "id": "string", "url": "string", "filename": "string", "size": number, "mimeType": "string" }
```

### List Media

```
GET /api/sites/:siteId/media
Response 200: [ { "id": "string", "url": "string", "filename": "string", "size": number, "mimeType": "string" } ]
```

### Delete Media

```
DELETE /api/media/:mediaId
Response 204
```

---

## Export

### Trigger Export

```
POST /api/export/:siteId
Response 202: { "exportId": "string", "status": "processing" }
```

### Download Export

```
GET /api/export/:exportId/download
Response 200: application/zip (binary download)
```

---

## Modules

### List Installed Modules

```
GET /api/modules
Response 200: [ { "id": "string", "name": "string", "version": "string", "enabled": boolean } ]
```

### Install Module

```
POST /api/modules/install
{ "npmPackage": "string" }
Response 201: { "id": "string", "name": "string", "version": "string" }
```

### Configure Module

```
PUT /api/modules/:moduleId
{ "settings": {} }
Response 200: { "id": "string", "settings": {} }
```

### Enable/Disable Module

```
POST /api/modules/:moduleId/enable
{ "enabled": boolean }
Response 200: { "id": "string", "enabled": boolean }
```
