import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { roomApi } from '../../api/roomApi';
import { EVENTS } from '../../utils/socketEvents';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

export default function JoinRoom({ onCancel }) {
  const { token } = useAuth();
  const { emit, connected } = useSocket();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const room = await roomApi.getRoomByCode(token, code.trim());
      if (room.status !== 'waiting') {
        toast.error('That game is already in progress');
        return;
      }
      // Join via socket so LobbyPage JOIN_SUCCESS shows WaitingRoom
      // (same path as Create Room / Quick Join — never skip straight to /game)
      if (!connected) {
        toast.error('Not connected yet — try again in a moment');
        return;
      }
      emit(EVENTS.JOIN_ROOM, { roomCode: room.code });
    } catch {
      toast.error('Room not found. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Room Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm text-center tracking-[0.4em] uppercase font-bold text-lg focus:outline-none focus:border-primary"
          placeholder="A3K7PQ"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>Cancel</Button>
        <Button type="submit" fullWidth disabled={loading || code.length < 4}>
          {loading ? 'Joining…' : 'Join Room'}
        </Button>
      </div>
    </form>
  );
}
