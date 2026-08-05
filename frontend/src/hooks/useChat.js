import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { EVENTS } from '../utils/socketEvents';

/**
 * Online room chat — messages for the current roomCode only.
 */
export const useChat = (roomCode) => {
  const { emit, on } = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([]);
    if (!roomCode) return undefined;

    const offHistory = on(EVENTS.CHAT_HISTORY, ({ messages: history }) => {
      setMessages(Array.isArray(history) ? history : []);
    });

    const offMessage = on(EVENTS.CHAT_MESSAGE, (message) => {
      if (!message?.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    // Request history after listeners are attached (join may have fired earlier).
    emit(EVENTS.REQUEST_CHAT_HISTORY, { roomCode });

    return () => {
      offHistory();
      offMessage();
    };
  }, [roomCode, on, emit]);

  const sendMessage = useCallback(
    (text) => {
      const trimmed = typeof text === 'string' ? text.trim() : '';
      if (!trimmed || !roomCode) return;
      emit(EVENTS.SEND_CHAT, { roomCode, text: trimmed });
    },
    [emit, roomCode]
  );

  return { messages, sendMessage };
};
