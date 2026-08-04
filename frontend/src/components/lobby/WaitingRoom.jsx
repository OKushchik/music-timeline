import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { EVENTS } from '../../utils/socketEvents';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

export default function WaitingRoom({ room: initialRoom, onLeave }) {
  const { user } = useAuth();
  const { emit, on } = useSocket();
  const navigate = useNavigate();
  const [room, setRoom]     = useState(initialRoom);
  const [isReady, setReady] = useState(false);

  const isHost =
    String(room?.host?._id || room?.host) === String(user?._id);

  useEffect(() => {
    const offRoomUpdated = on(EVENTS.ROOM_UPDATED, (updated) => setRoom(updated));
    const offGameStarted = on(EVENTS.GAME_STARTED, ({ room: startedRoom }) => {
      const isInGame = startedRoom.players.some(
        (p) => p.userId === user?._id || p.userId?.toString?.() === user?._id
      );
      if (isInGame) {
        navigate(`/game/${startedRoom.code}`);
      } else {
        toast('You were not marked as ready and have been removed from the game.', { icon: '⚠️' });
        navigate('/');
      }
    });
    return () => { offRoomUpdated(); offGameStarted(); };
  }, [on, navigate, room?.code, user?._id]);

  const toggleReady = () => {
    const next = !isReady;
    setReady(next);
    emit(EVENTS.PLAYER_READY, { roomCode: room.code, isReady: next });
  };

  const startGame = () => {
    emit(EVENTS.START_GAME, { roomCode: room.code });
  };

  const leaveRoom = () => {
    emit(EVENTS.LEAVE_ROOM, { roomCode: room.code });
    toast.success('Left the room');
    if (onLeave) onLeave();
    else navigate('/lobby');
  };

  if (!room) return null;

  return (
    <div className="bg-darker border border-card rounded-xl p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{room.name}</h2>
        <span className="bg-card text-primary font-mono text-lg px-3 py-1 rounded-lg tracking-widest">
          {room.code}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4">
        Share the room code with friends. Game starts when host clicks Start.
      </p>

      {/* Player list */}
      <ul className="flex flex-col gap-2 mb-6">
        {room.players.map((p) => (
          <li key={p.userId} className="flex items-center justify-between bg-card rounded-lg px-4 py-2">
            <span className="text-white font-medium">
              {p.username}
              {(String(p.userId) === String(room.host?._id || room.host)) && (
                <span className="ml-2 text-xs text-yellow-400">👑 Host</span>
              )}
            </span>
            <span className={p.isReady ? 'text-green-400 text-xs' : 'text-gray-500 text-xs'}>
              {p.isReady ? '✅ Ready' : '⏳ Waiting'}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Button variant={isReady ? 'secondary' : 'ghost'} fullWidth onClick={toggleReady}>
          {isReady ? '✅ Ready!' : 'Mark Ready'}
        </Button>
        {isHost && (
          <Button
            fullWidth
            onClick={startGame}
            disabled={!isReady}
            title={!isReady ? 'You must be ready before starting' : ''}
          >
            {isReady ? '🚀 Start Game' : '🔒 Mark yourself ready first'}
          </Button>
        )}
      </div>

      <Button variant="danger" fullWidth className="mt-3" onClick={leaveRoom}>
        Leave Room
      </Button>
    </div>
  );
}

