import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url?: string;
  room?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL ?? '',
    room,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  useEffect(() => {
    if (!autoConnect) return;
    if (!url) return;

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (room) socket.emit('join-room', room);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (err) => {
      onError?.(new Error(err.message));
    });

    socket.on('message', (data: unknown) => {
      setLastMessage(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, room, autoConnect, onConnect, onDisconnect, onError]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const sendMessage = useCallback((data: unknown) => {
    socketRef.current?.emit('message', data);
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  const getSocket = useCallback(() => socketRef.current, []);

  return {
    getSocket,
    isConnected,
    lastMessage,
    emit,
    sendMessage,
    disconnect,
  };
}
