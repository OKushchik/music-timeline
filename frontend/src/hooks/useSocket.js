import { useContext, useEffect, useCallback } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
  const { socket, connected } = useContext(SocketContext);

  /**
   * Emit a socket event.
   * @param {string} event
   * @param {*} data
   */
  const emit = useCallback(
    (event, data) => {
      if (socket?.connected) socket.emit(event, data);
    },
    [socket]
  );

  /**
   * Register a one-time or persistent listener.
   * Automatically cleaned up when the component unmounts.
   */
  const on = useCallback(
    (event, handler) => {
      socket?.on(event, handler);
      return () => socket?.off(event, handler);
    },
    [socket]
  );

  return { socket, connected, emit, on };
};

