import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function connectToRoom(roomId: string): Socket {
  const s = getSocket();
  s.emit("join-room", roomId);
  return s;
}

export function leaveRoom(roomId: string): void {
  socket?.emit("leave-room", roomId);
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function sendBuilderUpdate(
  roomId: string,
  update: { type: string; payload: unknown; userId: string },
): void {
  socket?.emit("builder:update", { roomId, ...update });
}
