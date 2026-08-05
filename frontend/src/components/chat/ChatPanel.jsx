import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import Button from '../shared/Button';

/**
 * Real-time chat panel for online rooms (lobby + game).
 * @param {string} roomCode
 * @param {boolean} [collapsible] — compact toggle on small screens / game sidebar
 */
export default function ChatPanel({ roomCode, collapsible = false }) {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat(roomCode);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(!collapsible);
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);
  /** null = not synced yet (skip initial history as unread) */
  const seenCountRef = useRef(null);

  useEffect(() => {
    setUnread(0);
    seenCountRef.current = null;
  }, [roomCode]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      seenCountRef.current = messages.length;
      return;
    }

    // First load / history hydrate while collapsed — mark as seen, no badge
    if (seenCountRef.current === null) {
      seenCountRef.current = messages.length;
      return;
    }

    if (messages.length > seenCountRef.current) {
      const added = messages.slice(seenCountRef.current);
      const fromOthers = added.filter(
        (m) => String(m.userId) !== String(user?._id)
      );
      if (fromOthers.length > 0) {
        setUnread((n) => n + fromOthers.length);
      }
    }

    seenCountRef.current = messages.length;
  }, [messages, open, user?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  const unreadLabel = unread > 99 ? '99+' : String(unread);

  return (
    <div className="bg-darker border border-card rounded-xl overflow-hidden flex flex-col min-h-0">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 text-left"
        >
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Chat
          </h3>
          <span className="flex items-center gap-2 text-gray-500 text-xs">
            {!open && unread > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-accent text-white text-[10px] font-bold leading-none"
                aria-label={`${unread} unread messages`}
              >
                {unreadLabel}
              </span>
            )}
            {open ? 'Hide' : 'Show'}
          </span>
        </button>
      ) : (
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Chat
          </h3>
        </div>
      )}

      {open && (
        <>
          <ul
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2 max-h-48 min-h-[8rem]"
          >
            {messages.length === 0 && (
              <li className="text-gray-500 text-sm text-center py-4">
                No messages yet
              </li>
            )}
            {messages.map((m) => {
              const isMine = String(m.userId) === String(user?._id);
              return (
                <li
                  key={m.id}
                  className={`text-sm rounded-lg px-3 py-1.5 max-w-[90%] ${
                    isMine
                      ? 'bg-primary/20 text-white self-end'
                      : 'bg-card text-gray-200 self-start'
                  }`}
                >
                  {!isMine && (
                    <span className="block text-xs text-primary font-medium mb-0.5">
                      {m.username}
                    </span>
                  )}
                  <span className="break-words whitespace-pre-wrap">{m.text}</span>
                </li>
              );
            })}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t border-card"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              placeholder="Type a message…"
              className="flex-1 min-w-0 bg-card text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-500"
            />
            <Button type="submit" className="text-xs px-3 py-2 shrink-0" disabled={!text.trim()}>
              Send
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
