# Real-Time Collaboration Guide

SUKIT supports multiple editors working on the same page simultaneously, with cursor tracking and conflict resolution.

## WebSocket Setup

The collaboration system uses Socket.io on the backend server.

```typescript
// apps/server/src/websocket/server.ts
import { Server as SocketServer } from 'socket.io';

const io = new SocketServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGINS?.split(',') },
  path: '/ws',
});

io.on('connection', (socket) => {
  // Handle joining/leaving rooms
});
```

## Room Concept

Each page is a room. Editors join the room for the page they're editing.

```typescript
// Joining a page room
socket.emit('join-page', { pageId: 'page-123' });

// Leaving
socket.emit('leave-page', { pageId: 'page-123' });
```

## CRDT Conflict Resolution

SUKIT uses a last-write-wins CRDT strategy with version tracking:

```typescript
interface CollaborationMessage {
  type: 'UPDATE_BLOCK' | 'MOVE_BLOCK' | 'DELETE_BLOCK' | 'ADD_BLOCK';
  blockId: string;
  data: Record<string, unknown>;
  version: number;
  userId: string;
  timestamp: number;
  nonce: string;
}
```

When a conflict occurs:

1. Compare `version` numbers (higher wins)
2. If versions match, compare `timestamp` (later wins)
3. If timestamps match, compare `nonce` (lexicographic order)

## Cursor Tracking

Each editor's cursor position is broadcast to all other users in the same room:

```typescript
interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  sectionId: string | null;
  blockId: string | null;
  x: number;
  y: number;
}

// Broadcast cursor position
socket.emit('cursor-move', {
  sectionId: 'sec-1',
  blockId: 'blk-3',
  x: 450,
  y: 320,
});
```

## Presence Indicators

The UI shows who is currently editing:

- **Avatars** — User avatars in the header bar
- **Color-coded cursors** — Each user has a unique color
- **Block highlighting** — Blocks being edited by others show a colored border
- **Active users list** — Click avatars to see who is online
