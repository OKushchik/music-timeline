import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const next = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
    });

    next.on('connect', () => setConnected(true));
    next.on('disconnect', () => setConnected(false));

    socketRef.current = next;
    setSocket(next);

    return () => {
      next.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
