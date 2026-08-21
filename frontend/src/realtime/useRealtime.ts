import { useEffect, useRef, useState, useCallback } from 'react';

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

export interface RealtimeMessage {
  type: string;
  data: any;
}

export function useRealtime() {
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    subscribersRef.current.get(eventType)!.add(callback);

    return () => {
      subscribersRef.current.get(eventType)?.delete(callback);
    };
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('CONNECTING');
    // Vercel serves the static frontend and cannot keep the backend's persistent
    // WebSocket connection. In production, connect to the API host directly.
    // Leaving VITE_WS_URL unset preserves the local Vite proxy workflow.
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws/realtime`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Realtime] WebSocket connected');
        setStatus('CONNECTED');
      };

      ws.onmessage = (event) => {
        try {
          const parsed: RealtimeMessage = JSON.parse(event.data);
          setLastMessage(parsed);

          // Dispatch to specific event listeners
          const listeners = subscribersRef.current.get(parsed.type);
          if (listeners) {
            listeners.forEach((cb) => cb(parsed.data));
          }
          // Also dispatch to wildcard '*' listeners
          const wildcardListeners = subscribersRef.current.get('*');
          if (wildcardListeners) {
            wildcardListeners.forEach((cb) => cb(parsed));
          }
        } catch (err) {
          console.error('[Realtime] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.warn('[Realtime] WebSocket disconnected. Retrying in 2.5s...');
        setStatus('DISCONNECTED');
        wsRef.current = null;
        reconnectTimeoutRef.current = window.setTimeout(connect, 2500);
      };

      ws.onerror = (err) => {
        console.error('[Realtime] WebSocket error:', err);
        ws.close();
      };
    } catch (e) {
      console.error('[Realtime] Connection initialization error:', e);
      setStatus('DISCONNECTED');
      reconnectTimeoutRef.current = window.setTimeout(connect, 2500);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    status,
    lastMessage,
    subscribe,
    reconnect: connect,
  };
}
